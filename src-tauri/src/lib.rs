use std::sync::{Arc, Mutex};
use tauri::Manager;

pub mod clipboard;
pub mod commands;
pub mod crypto;
pub mod db;
pub mod totp;
pub mod vault;

use vault::manager::{SharedVaultManager, VaultManager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("./veylock_data"));

            let manager = VaultManager::new(app_dir);
            let shared_manager: SharedVaultManager = Arc::new(Mutex::new(manager));

            app.manage(shared_manager);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_vault_status,
            commands::create_vault,
            commands::unlock_vault,
            commands::lock_vault,
            commands::set_auto_lock_timer,
            commands::touch_user_activity,
            commands::get_entries,
            commands::save_entry,
            commands::delete_entry,
            commands::generate_password,
            commands::generate_totp_code,
            commands::validate_totp,
            commands::get_vault_health,
            commands::export_vault_backup,
            commands::export_vault_backup_string,
            commands::import_vault_backup,
            commands::change_master_password,
            commands::export_plaintext_csv,
            commands::export_plaintext_csv_string,
            commands::import_plaintext_csv,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
