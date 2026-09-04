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
pub fn touch_user_activity(state: State<'_, SharedVaultManager>) -> Result<(), String> {
    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    manager.touch_activity();
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

    let mut csv_out = String::from("title,username,email,password,url,category,notes,totp_secret\r\n");
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
            "{},{},{},{},{},{},{},{}\r\n",
            title, user, email, pass, url, cat, notes, totp
        ));
    }

    if let Some(parent) = std::path::Path::new(&dest_path).parent() {
        if !parent.as_os_str().is_empty() {
            let _ = fs::create_dir_all(parent);
        }
    }

    fs::write(dest_path, csv_out).map_err(|e| format!("Failed to write CSV: {}", e))?;
    Ok(())
}

fn escape_csv(val: &str) -> String {
    let mut sanitized = val.to_string();
    // Neutralize formula injection in spreadsheet software (Excel, LibreOffice)
    if let Some(first) = sanitized.chars().next() {
        if matches!(first, '=' | '+' | '-' | '@' | '\t' | '\r') {
            sanitized = format!("'{}", sanitized);
        }
    }

    if sanitized.contains(',')
        || sanitized.contains('"')
        || sanitized.contains('\n')
        || sanitized.contains('\r')
        || sanitized.starts_with('\'')
    {
        format!("\"{}\"", sanitized.replace('"', "\"\""))
    } else {
        sanitized
    }
}

fn clean_csv_field(val: &str) -> String {
    let trimmed = val.trim();
    if let Some(stripped) = trimmed.strip_prefix('\'') {
        if let Some(first) = stripped.chars().next() {
            if matches!(first, '=' | '+' | '-' | '@' | '\t' | '\r') {
                return stripped.to_string();
            }
        }
    }
    trimmed.to_string()
}

fn parse_rfc4180_csv(input: &str) -> Vec<Vec<String>> {
    let mut records = Vec::new();
    let mut current_record = Vec::new();
    let mut current_field = String::new();
    let mut in_quotes = false;
    let mut chars = input.chars().peekable();

    while let Some(c) = chars.next() {
        if in_quotes {
            if c == '"' {
                if chars.peek() == Some(&'"') {
                    chars.next(); // consume escaped quote
                    current_field.push('"');
                } else {
                    in_quotes = false;
                }
            } else {
                current_field.push(c);
            }
        } else {
            match c {
                '"' => {
                    in_quotes = true;
                }
                ',' => {
                    current_record.push(std::mem::take(&mut current_field));
                }
                '\r' => {
                    if chars.peek() == Some(&'\n') {
                        chars.next();
                    }
                    current_record.push(std::mem::take(&mut current_field));
                    if !current_record.iter().all(|f| f.trim().is_empty()) {
                        records.push(std::mem::take(&mut current_record));
                    } else {
                        current_record.clear();
                    }
                }
                '\n' => {
                    current_record.push(std::mem::take(&mut current_field));
                    if !current_record.iter().all(|f| f.trim().is_empty()) {
                        records.push(std::mem::take(&mut current_record));
                    } else {
                        current_record.clear();
                    }
                }
                _ => {
                    current_field.push(c);
                }
            }
        }
    }

    if !current_field.is_empty() || !current_record.is_empty() {
        current_record.push(current_field);
        if !current_record.iter().all(|f| f.trim().is_empty()) {
            records.push(current_record);
        }
    }

    records
}

#[tauri::command]
pub fn import_plaintext_csv(
    state: State<'_, SharedVaultManager>,
    src_path: String,
) -> Result<usize, String> {
    let content = if src_path.contains('\n') || src_path.starts_with("title") || src_path.starts_with("Title") {
        src_path
    } else {
        match fs::read_to_string(&src_path) {
            Ok(c) => c,
            Err(_) => src_path, // fallback if raw CSV was passed
        }
    };

    let mut manager = state.lock().map_err(|_| "Failed to acquire vault lock")?;
    if !manager.is_unlocked() {
        return Err("Vault is locked".to_string());
    }

    let records = parse_rfc4180_csv(&content);
    if records.is_empty() {
        return Ok(0);
    }

    let mut count = 0;
    let mut title_idx = 0;
    let mut user_idx = 1;
    let mut email_idx = 2;
    let mut pass_idx = 3;
    let mut url_idx = 4;
    let mut cat_idx = 5;
    let mut notes_idx = 6;
    let mut totp_idx = 7;
    let mut start_row = 0;

    // Check if first row is header
    if let Some(first_row) = records.first() {
        let is_header = first_row.iter().any(|h| {
            let lh = h.trim().to_lowercase();
            lh == "title" || lh == "password" || lh == "username"
        });

        if is_header {
            start_row = 1;
            for (idx, col) in first_row.iter().enumerate() {
                let name = col.trim().to_lowercase();
                match name.as_str() {
                    "title" => title_idx = idx,
                    "username" | "user" | "login" => user_idx = idx,
                    "email" => email_idx = idx,
                    "password" | "pass" => pass_idx = idx,
                    "url" | "website" => url_idx = idx,
                    "category" => cat_idx = idx,
                    "notes" | "note" => notes_idx = idx,
                    "totp_secret" | "totp" | "otp" => totp_idx = idx,
                    _ => {}
                }
            }
        }
    }

    for row in records.into_iter().skip(start_row) {
        if row.is_empty() {
            continue;
        }

        let title = row.get(title_idx).map(|s| clean_csv_field(s)).unwrap_or_default();
        let pass = row.get(pass_idx).map(|s| clean_csv_field(s)).unwrap_or_default();
        if title.is_empty() && pass.is_empty() {
            continue;
        }

        let user = row.get(user_idx).map(|s| clean_csv_field(s)).unwrap_or_default();
        let email = row.get(email_idx).map(|s| clean_csv_field(s)).unwrap_or_default();
        let url = row.get(url_idx).map(|s| clean_csv_field(s)).unwrap_or_default();
        let mut category = row.get(cat_idx).map(|s| clean_csv_field(s)).unwrap_or_else(|| "logins".to_string());
        if category.is_empty() {
            category = "logins".to_string();
        }
        let notes = row.get(notes_idx).map(|s| clean_csv_field(s)).unwrap_or_default();
        let totp_secret = row.get(totp_idx).map(|s| clean_csv_field(s)).filter(|s| !s.is_empty());

        let entry = DecryptedEntry {
            id: Uuid::new_v4().to_string(),
            title: if title.is_empty() { "Imported Credential".to_string() } else { title },
            username: user,
            email,
            password: pass,
            url,
            category,
            notes,
            favorite: false,
            tags: vec![],
            custom_fields: vec![],
            totp_secret,
            totp_issuer: None,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
            last_used_at: None,
        };

        if manager.save_entry(entry).is_ok() {
            count += 1;
        }
    }

    Ok(count)
}
