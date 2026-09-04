use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomField {
    pub id: String,
    pub name: String,
    pub value: String,
    #[serde(rename = "fieldType", alias = "field_type")]
    pub field_type: String, // "text" | "sensitive"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecryptedEntry {
    pub id: String,
    pub title: String,
    pub username: String,
    pub email: String,
    pub password: String,
    pub url: String,
    pub notes: String,
    pub category: String, // "logins" | "secure_notes" | "cards" | "identity" | "servers"
    pub favorite: bool,
    pub tags: Vec<String>,
    pub custom_fields: Vec<CustomField>,
    pub totp_secret: Option<String>,
    pub totp_issuer: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub last_used_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecryptedEntryHeader {
    pub id: String,
    pub title: String,
    pub username: String,
    pub email: String,
    pub url: String,
    pub category: String,
    pub favorite: bool,
    pub tags: Vec<String>,
    pub has_totp: bool,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultStatus {
    pub exists: bool,
    pub unlocked: bool,
    pub auto_lock_minutes: u32,
    pub entry_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PwGenConfig {
    pub length: u32,
    pub use_uppercase: bool,
    pub use_lowercase: bool,
    pub use_numbers: bool,
    pub use_symbols: bool,
    pub exclude_ambiguous: bool,
    pub passphrase_mode: bool,
    pub word_count: u32,
    pub separator: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TotpResult {
    pub code: String,
    pub time_remaining: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultHealthReport {
    pub total_entries: usize,
    pub weak_passwords: usize,
    pub reused_passwords: usize,
    pub missing_totp: usize,
    pub total_score: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortableVaultBackup {
    pub version: u32,
    pub magic: String,
    pub created_at: String,
    pub kdf_salt_b64: String,
    pub wrapped_vek_nonce_b64: String,
    pub wrapped_vek_ciphertext_b64: String,
    pub entries: Vec<BackupEntryItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupEntryItem {
    pub id: String,
    pub category: String,
    pub favorite: bool,
    pub created_at: String,
    pub updated_at: String,
    pub last_used_at: Option<String>,
    pub nonce_b64: String,
    pub encrypted_payload_b64: String,
}
