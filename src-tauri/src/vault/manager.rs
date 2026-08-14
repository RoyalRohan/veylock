use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use chrono::Utc;
use uuid::Uuid;
use zeroize::Zeroize;

use crate::crypto::aes_gcm::{decrypt_bytes, encrypt_bytes};
use crate::crypto::argon2_kdf::{derive_kek, generate_random_salt};
use crate::crypto::key_wrap::{generate_vault_key, unwrap_vault_key, wrap_vault_key, VaultKey};
use crate::db::sqlite::{
    delete_entry_record, get_all_encrypted_entries, get_metadata, init_db, save_encrypted_entry,
    save_metadata, wipe_all_entries,
};

use super::models::{BackupEntryItem, DecryptedEntry, PortableVaultBackup};

pub struct VaultManager {
    db_path: PathBuf,
    active_key: Option<VaultKey>,
    auto_lock_minutes: u32,
    last_activity: u64,
}

impl VaultManager {
    pub fn new(app_dir: PathBuf) -> Self {
        let db_path = app_dir.join("vault.sqlite");
        Self {
            db_path,
            active_key: None,
            auto_lock_minutes: 5,
            last_activity: Self::current_timestamp(),
        }
    }

    fn current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }

    pub fn touch_activity(&mut self) {
        self.last_activity = Self::current_timestamp();
    }

    pub fn set_auto_lock_minutes(&mut self, mins: u32) {
        self.auto_lock_minutes = mins;
        self.touch_activity();
    }

    pub fn check_auto_lock(&mut self) -> bool {
        if self.active_key.is_none() || self.auto_lock_minutes == 0 {
            return false;
        }

        let now = Self::current_timestamp();
        let elapsed_mins = (now.saturating_sub(self.last_activity)) / 60;
        if elapsed_mins >= self.auto_lock_minutes as u64 {
            self.lock_vault();
            true
        } else {
            false
        }
    }

    pub fn is_initialized(&self) -> bool {
        if !self.db_path.exists() {
            return false;
        }
        if let Ok(conn) = init_db(&self.db_path) {
            matches!(get_metadata(&conn, "wrapped_vek_ciphertext"), Ok(Some(_)))
        } else {
            false
        }
    }

    pub fn is_unlocked(&self) -> bool {
        self.active_key.is_some()
    }

    pub fn auto_lock_minutes(&self) -> u32 {
        self.auto_lock_minutes
    }

    pub fn create_vault(&mut self, master_password: &str) -> Result<(), String> {
        if master_password.trim().len() < 8 {
            return Err("Master password must be at least 8 characters long.".to_string());
        }

        let conn = init_db(&self.db_path)?;
        let salt = generate_random_salt();
        let kek = derive_kek(master_password, &salt)?;
        let vek = generate_vault_key();
        let wrapped_vek = wrap_vault_key(&vek, &kek)?;

        save_metadata(&conn, "kdf_salt", &salt)?;
        save_metadata(&conn, "kdf_algorithm", "argon2id")?;
        save_metadata(&conn, "wrapped_vek_nonce", &wrapped_vek.nonce_b64)?;
        save_metadata(&conn, "wrapped_vek_ciphertext", &wrapped_vek.ciphertext_b64)?;

        self.active_key = Some(vek);
        self.touch_activity();
        Ok(())
    }

    pub fn unlock_vault(&mut self, master_password: &str) -> Result<bool, String> {
        let conn = init_db(&self.db_path)?;

        let salt = get_metadata(&conn, "kdf_salt")?
            .ok_or_else(|| "Vault metadata corrupt: missing KDF salt".to_string())?;
        let nonce_b64 = get_metadata(&conn, "wrapped_vek_nonce")?
            .ok_or_else(|| "Vault metadata corrupt: missing VEK nonce".to_string())?;
        let ciphertext_b64 = get_metadata(&conn, "wrapped_vek_ciphertext")?
            .ok_or_else(|| "Vault metadata corrupt: missing VEK ciphertext".to_string())?;

        let kek = derive_kek(master_password, &salt)?;
        match unwrap_vault_key(&kek, &nonce_b64, &ciphertext_b64) {
            Ok(vek) => {
                self.active_key = Some(vek);
                self.touch_activity();
                Ok(true)
            }
            Err(_) => Ok(false),
        }
    }

    pub fn lock_vault(&mut self) {
        if let Some(mut key) = self.active_key.take() {
            key.0.zeroize();
        }
    }

    pub fn get_entries(&mut self) -> Result<Vec<DecryptedEntry>, String> {
        self.check_auto_lock();
        let key = self
            .active_key
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;

        let conn = init_db(&self.db_path)?;
        let raw_records = get_all_encrypted_entries(&conn)?;

        let mut decrypted_list = Vec::new();
        for rec in raw_records {
            if let Ok(payload_bytes) = decrypt_bytes(&key.0, &rec.nonce_b64, &rec.encrypted_payload_b64) {
                if let Ok(entry) = serde_json::from_slice::<DecryptedEntry>(&payload_bytes) {
                    decrypted_list.push(entry);
                }
            }
        }

        self.touch_activity();
        Ok(decrypted_list)
    }

    pub fn save_entry(&mut self, mut entry: DecryptedEntry) -> Result<String, String> {
        self.check_auto_lock();
        let key = self
            .active_key
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?;

        let conn = init_db(&self.db_path)?;

        if entry.id.trim().is_empty() {
            entry.id = Uuid::new_v4().to_string();
            entry.created_at = Utc::now().to_rfc3339();
        }
        entry.updated_at = Utc::now().to_rfc3339();

        let json_bytes = serde_json::to_vec(&entry)
            .map_err(|e| format!("Failed to serialize entry JSON: {}", e))?;

        let encrypted = encrypt_bytes(&key.0, &json_bytes)?;

        save_encrypted_entry(
            &conn,
            &entry.id,
            &entry.category,
            entry.favorite,
            &entry.created_at,
            &entry.updated_at,
            entry.last_used_at.as_deref(),
            &encrypted.nonce_b64,
            &encrypted.ciphertext_b64,
        )?;

        self.touch_activity();
        Ok(entry.id)
    }

    pub fn delete_entry(&mut self, id: &str) -> Result<(), String> {
        self.check_auto_lock();
        if self.active_key.is_none() {
            return Err("Vault is locked".to_string());
        }

        let conn = init_db(&self.db_path)?;
        delete_entry_record(&conn, id)?;

        self.touch_activity();
        Ok(())
    }

    pub fn change_master_password(&mut self, old_pass: &str, new_pass: &str) -> Result<(), String> {
        self.check_auto_lock();
        if new_pass.trim().len() < 8 {
            return Err("New master password must be at least 8 characters.".to_string());
        }

        let current_key = self
            .active_key
            .as_ref()
            .ok_or_else(|| "Vault is locked".to_string())?
            .clone();

        let conn = init_db(&self.db_path)?;
        let salt = get_metadata(&conn, "kdf_salt")?
            .ok_or_else(|| "Missing salt".to_string())?;
        let nonce_b64 = get_metadata(&conn, "wrapped_vek_nonce")?
            .ok_or_else(|| "Missing nonce".to_string())?;
        let ciphertext_b64 = get_metadata(&conn, "wrapped_vek_ciphertext")?
            .ok_or_else(|| "Missing ciphertext".to_string())?;

        let old_kek = derive_kek(old_pass, &salt)?;
        if unwrap_vault_key(&old_kek, &nonce_b64, &ciphertext_b64).is_err() {
            return Err("Current master password is incorrect.".to_string());
        }

        // Generate new salt and new KEK
        let new_salt = generate_random_salt();
        let new_kek = derive_kek(new_pass, &new_salt)?;

        // Re-wrap existing VEK (no need to re-encrypt individual entries!)
        let rewrapped = wrap_vault_key(&current_key, &new_kek)?;

        save_metadata(&conn, "kdf_salt", &new_salt)?;
        save_metadata(&conn, "wrapped_vek_nonce", &rewrapped.nonce_b64)?;
        save_metadata(&conn, "wrapped_vek_ciphertext", &rewrapped.ciphertext_b64)?;

        self.touch_activity();
        Ok(())
    }

    pub fn export_backup(&mut self, dest_path: &str) -> Result<(), String> {
        self.check_auto_lock();
        if self.active_key.is_none() {
            return Err("Vault is locked".to_string());
        }

        let conn = init_db(&self.db_path)?;
        let salt = get_metadata(&conn, "kdf_salt")?.unwrap_or_default();
        let nonce_b64 = get_metadata(&conn, "wrapped_vek_nonce")?.unwrap_or_default();
        let ciphertext_b64 = get_metadata(&conn, "wrapped_vek_ciphertext")?.unwrap_or_default();

        let raw_records = get_all_encrypted_entries(&conn)?;
        let items: Vec<BackupEntryItem> = raw_records
            .into_iter()
            .map(|r| BackupEntryItem {
                id: r.id,
                category: r.category,
                favorite: r.is_favorite,
                created_at: r.created_at,
                updated_at: r.updated_at,
                last_used_at: r.last_used_at,
                nonce_b64: r.nonce_b64,
                encrypted_payload_b64: r.encrypted_payload_b64,
            })
            .collect();

        let backup = PortableVaultBackup {
            version: 1,
            magic: "VEYLOCK_VAULT_V1".to_string(),
            created_at: Utc::now().to_rfc3339(),
            kdf_salt_b64: salt,
            wrapped_vek_nonce_b64: nonce_b64,
            wrapped_vek_ciphertext_b64: ciphertext_b64,
            entries: items,
        };

        let json_str = serde_json::to_string_pretty(&backup)
            .map_err(|e| format!("Failed to build backup JSON: {}", e))?;

        fs::write(dest_path, json_str)
            .map_err(|e| format!("Failed to write backup file to disk: {}", e))?;

        self.touch_activity();
        Ok(())
    }

    pub fn import_backup(&mut self, src_path: &str, master_password: &str) -> Result<(), String> {
        let json_str = fs::read_to_string(src_path)
            .map_err(|e| format!("Failed to read backup file: {}", e))?;

        let backup: PortableVaultBackup = serde_json::from_str(&json_str)
            .map_err(|e| format!("Invalid Veylock backup file format: {}", e))?;

        if backup.magic != "VEYLOCK_VAULT_V1" {
            return Err("Incompatible vault magic header.".to_string());
        }

        // Test unwrapping imported VEK with provided master password
        let kek = derive_kek(master_password, &backup.kdf_salt_b64)?;
        let vek = unwrap_vault_key(&kek, &backup.wrapped_vek_nonce_b64, &backup.wrapped_vek_ciphertext_b64)
            .map_err(|_| "Incorrect master password for backup file.".to_string())?;

        let conn = init_db(&self.db_path)?;
        wipe_all_entries(&conn)?;

        save_metadata(&conn, "kdf_salt", &backup.kdf_salt_b64)?;
        save_metadata(&conn, "wrapped_vek_nonce", &backup.wrapped_vek_nonce_b64)?;
        save_metadata(&conn, "wrapped_vek_ciphertext", &backup.wrapped_vek_ciphertext_b64)?;

        for item in backup.entries {
            save_encrypted_entry(
                &conn,
                &item.id,
                &item.category,
                item.favorite,
                &item.created_at,
                &item.updated_at,
                item.last_used_at.as_deref(),
                &item.nonce_b64,
                &item.encrypted_payload_b64,
            )?;
        }

        self.active_key = Some(vek);
        self.touch_activity();
        Ok(())
    }
}

pub type SharedVaultManager = Arc<Mutex<VaultManager>>;
