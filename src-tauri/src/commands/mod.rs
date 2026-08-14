use std::fs;
use tauri::State;
use uuid::Uuid;

use crate::totp::generator::generate_totp_code as calc_totp;
use crate::vault::health::evaluate_vault_health;
use crate::vault::manager::SharedVaultManager;
use crate::vault::models::{
    DecryptedEntry, PwGenConfig, TotpResult, VaultHealthReport, VaultStatus,
};
use crate::vault::password_gen::generate_password_csprng;

#[tauri::command]
pub fn get_vault_status(state: State<'_, SharedVaultManager>) -> Result<VaultStatus, String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.check_auto_lock();

    let entry_count = if manager.is_unlocked() {
        manager.get_entries().map(|e| e.len()).unwrap_or(0)
    } else {
        0
    };

    Ok(VaultStatus {
        exists: manager.is_initialized(),
        unlocked: manager.is_unlocked(),
        auto_lock_minutes: manager.auto_lock_minutes(),
        entry_count,
    })
}

#[tauri::command]
pub fn create_vault(
    state: State<'_, SharedVaultManager>,
    master_password: String,
) -> Result<VaultStatus, String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.create_vault(&master_password)?;

    Ok(VaultStatus {
        exists: true,
        unlocked: true,
        auto_lock_minutes: manager.auto_lock_minutes(),
        entry_count: 0,
    })
}

#[tauri::command]
pub fn unlock_vault(
    state: State<'_, SharedVaultManager>,
    master_password: String,
) -> Result<bool, String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.unlock_vault(&master_password)
}

#[tauri::command]
pub fn lock_vault(state: State<'_, SharedVaultManager>) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.lock_vault();
    Ok(())
}

#[tauri::command]
pub fn set_auto_lock_timer(state: State<'_, SharedVaultManager>, minutes: u32) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.set_auto_lock_minutes(minutes);
    Ok(())
}

#[tauri::command]
pub fn get_entries(state: State<'_, SharedVaultManager>) -> Result<Vec<DecryptedEntry>, String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.get_entries()
}

#[tauri::command]
pub fn save_entry(
    state: State<'_, SharedVaultManager>,
    entry: DecryptedEntry,
) -> Result<String, String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.save_entry(entry)
}

#[tauri::command]
pub fn delete_entry(state: State<'_, SharedVaultManager>, id: String) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.delete_entry(&id)
}

#[tauri::command]
pub fn generate_password(config: PwGenConfig) -> Result<String, String> {
    generate_password_csprng(&config)
}

#[tauri::command]
pub fn generate_totp_code(secret: String) -> Result<TotpResult, String> {
    if secret.trim().is_empty() {
        return Err("Secret is empty".to_string());
    }
    let (code, time_remaining) = calc_totp(&secret)?;
    Ok(TotpResult { code, time_remaining })
}

#[tauri::command]
pub fn get_vault_health(state: State<'_, SharedVaultManager>) -> Result<VaultHealthReport, String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    let entries = manager.get_entries()?;
    Ok(evaluate_vault_health(&entries))
}

#[tauri::command]
pub fn export_vault_backup(
    state: State<'_, SharedVaultManager>,
    dest_path: String,
) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.export_backup(&dest_path)
}

#[tauri::command]
pub fn import_vault_backup(
    state: State<'_, SharedVaultManager>,
    src_path: String,
    master_password: String,
) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.import_backup(&src_path, &master_password)
}

#[tauri::command]
pub fn change_master_password(
    state: State<'_, SharedVaultManager>,
    old_password: String,
    new_password: String,
) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.change_master_password(&old_password, &new_password)
}

#[tauri::command]
pub fn export_plaintext_csv(
    state: State<'_, SharedVaultManager>,
    dest_path: String,
) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    let entries = manager.get_entries()?;

    let mut csv_out = String::from("title,username,email,password,url,category,notes,totp_secret\n");
    for e in entries {
        let title = escape_csv(&e.title);
        let user = escape_csv(&e.username);
        let email = escape_csv(&e.email);
        let pass = escape_csv(&e.password);
        let url = escape_csv(&e.url);
        let cat = escape_csv(&e.category);
        let notes = escape_csv(&e.notes);
        let totp = escape_csv(e.totp_secret.as_deref().unwrap_or(""));

        csv_out.push_str(&format!(
            "{},{},{},{},{},{},{},{}\n",
            title, user, email, pass, url, cat, notes, totp
        ));
    }

    fs::write(dest_path, csv_out).map_err(|e| format!("Failed to write CSV: {}", e))?;
    Ok(())
}

fn escape_csv(val: &str) -> String {
    if val.contains(',') || val.contains('"') || val.contains('\n') {
        format!("\"{}\"", val.replace('"', "\"\""))
    } else {
        val.to_string()
    }
}

#[tauri::command]
pub fn import_plaintext_csv(
    state: State<'_, SharedVaultManager>,
    src_path: String,
) -> Result<usize, String> {
    let content = fs::read_to_string(src_path)
        .map_err(|e| format!("Failed to read CSV file: {}", e))?;

    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    if !manager.is_unlocked() {
        return Err("Vault is locked".to_string());
    }

    let mut count = 0;
    for (i, line) in content.lines().enumerate() {
        if i == 0 && (line.starts_with("title") || line.starts_with("Title")) {
            continue; // Header row
        }
        let cols: Vec<&str> = line.split(',').collect();
        if cols.len() >= 4 {
            let entry = DecryptedEntry {
                id: Uuid::new_v4().to_string(),
                title: cols.first().unwrap_or(&"").trim().trim_matches('"').to_string(),
                username: cols.get(1).unwrap_or(&"").trim().trim_matches('"').to_string(),
                email: cols.get(2).unwrap_or(&"").trim().trim_matches('"').to_string(),
                password: cols.get(3).unwrap_or(&"").trim().trim_matches('"').to_string(),
                url: cols.get(4).unwrap_or(&"").trim().trim_matches('"').to_string(),
                category: cols.get(5).unwrap_or(&"logins").trim().trim_matches('"').to_string(),
                notes: cols.get(6).unwrap_or(&"").trim().trim_matches('"').to_string(),
                favorite: false,
                tags: vec![],
                custom_fields: vec![],
                totp_secret: cols.get(7).map(|s| s.trim().trim_matches('"').to_string()).filter(|s| !s.is_empty()),
                totp_issuer: None,
                created_at: chrono::Utc::now().to_rfc3339(),
                updated_at: chrono::Utc::now().to_rfc3339(),
                last_used_at: None,
            };
            if manager.save_entry(entry).is_ok() {
                count += 1;
            }
        }
    }

    Ok(count)
}
