# Veylock Architecture Documentation

This document explains the software architecture, IPC boundaries, key management, database storage model, theme system, and UI integration of Veylock.

---

## 1. System High-Level Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          React 19 / TS Renderer                         │
│                                                                         │
│   • LockScreen / VaultSetup                                             │
│   • ThemeEngine (Dark / Light / System via ThemeContext)                │
│   • 7 Specialized Item Form Editors:                                    │
│       LoginForm, SecureNoteForm, AuthenticatorForm, CardForm,           │
│       LicenseForm, ServerForm, ApiCredentialForm                        │
│   • 7 Dedicated Detail View Renderers (EntryDetail.tsx)                 │
│   • Shannon Entropy Engine & CSPRNG Generator Modal                     │
│   • Security Health Dashboard & Dual-Save Import/Export                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │  Tauri IPC Invoke (JSON-RPC)
┌────────────────────────────────────▼────────────────────────────────────┐
│                          Tauri 2 / Rust Backend                         │
│                                                                         │
│   ├── VaultManager (In-memory session state, auto-lock timer, keepalive)│
│   ├── Crypto Engine (Argon2id, AES-256-GCM, Zeroize memory buffers)     │
│   ├── SQLite Engine (rusqlite local embedded database)                  │
│   ├── Clipboard Guard (30s background auto-wipe timer)                  │
│   ├── TOTP Engine (Base32 validation, RFC 6238 generation, 6/8 digits)  │
│   └── Dual-Save Export Pipeline (OS Downloads/Documents directory write)│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │  AES-256-GCM Encrypted Payloads
┌────────────────────────────────────▼────────────────────────────────────┐
│                            Local Persistence                            │
│   • `vault.sqlite` (Local device storage in application data directory) │
│   • `.vlock` (Portable encrypted vault backup file)                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Envelope Cryptography & Key Hierarchy

To enable instant master password updates without re-encrypting thousands of vault items individually, Veylock utilizes an envelope key derivation scheme:

```text
Master Password + Random Salt (16 bytes)
                 │
                 ▼
            Argon2id KDF
 (m=64MB, t=3, p=4, output_len=32B)
                 │
                 ▼
     Key Encryption Key (KEK)
                 │
                 ▼
 AES-256-GCM Unwrapping of Random 256-bit
      Vault Encryption Key (VEK)
                 │
                 ▼
  Decrypted VEK in RAM (Zeroized on Lock)
                 │
                 ▼
 AES-256-GCM Encryption / Decryption of Item Payloads
    (Unique 96-bit CSPRNG Nonce per entry)
```

1. **Zeroization**: The master password bytes, derived KEK, decrypted VEK, and transient TOTP secret buffers implement `zeroize::Zeroize` or `zeroize::ZeroizeOnDrop`, ensuring plaintext key material is cleared from RAM upon vault lock or application exit.
2. **Deterministic Derivation**: Salt is generated randomly via `rand::rngs::OsRng` upon vault creation and stored in `vault_metadata`.

---

## 3. Database & Payload Storage

All sensitive entry data is encapsulated in a JSON payload and encrypted into a single authenticated ciphertext string stored in SQLite.

### Table Schema

```sql
CREATE TABLE IF NOT EXISTS vault_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'logins',
    favorite INTEGER NOT NULL DEFAULT 0,
    encrypted_payload_b64 TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### Additive Decrypted Model (`DecryptedEntry`)

To ensure 100% backward compatibility with existing databases and backups, all item-specific fields in `DecryptedEntry` use `#[serde(default)]` and `Option<T>`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DecryptedEntry {
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub username: Option<String>,
    #[serde(default)]
    pub password: Option<String>,
    #[serde(default)]
    pub url: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub totp_secret: Option<String>,
    #[serde(default)]
    pub totp_issuer: Option<String>,
    #[serde(default)]
    pub totp_account: Option<String>,
    #[serde(default)]
    pub totp_digits: Option<u32>,
    #[serde(default)]
    pub totp_period: Option<u64>,
    #[serde(default)]
    pub totp_algorithm: Option<String>,
    #[serde(default)]
    pub cardholder_name: Option<String>,
    #[serde(default)]
    pub card_number: Option<String>,
    #[serde(default)]
    pub card_exp_month: Option<String>,
    #[serde(default)]
    pub card_exp_year: Option<String>,
    #[serde(default)]
    pub card_cvv: Option<String>,
    #[serde(default)]
    pub card_pin: Option<String>,
    #[serde(default)]
    pub card_billing_address: Option<String>,
    #[serde(default)]
    pub license_key: Option<String>,
    #[serde(default)]
    pub license_publisher: Option<String>,
    #[serde(default)]
    pub license_version: Option<String>,
    #[serde(default)]
    pub licensed_to: Option<String>,
    #[serde(default)]
    pub server_protocol: Option<String>,
    #[serde(default)]
    pub server_host: Option<String>,
    #[serde(default)]
    pub server_port: Option<u16>,
    #[serde(default)]
    pub server_ssh_key: Option<String>,
    #[serde(default)]
    pub api_environment: Option<String>,
    #[serde(default)]
    pub api_endpoint: Option<String>,
    #[serde(default)]
    pub api_key: Option<String>,
    #[serde(default)]
    pub api_secret: Option<String>,
    #[serde(default)]
    pub api_client_id: Option<String>,
    #[serde(default)]
    pub api_client_secret: Option<String>,
    #[serde(default)]
    pub custom_fields: Vec<CustomField>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub favorite: bool,
    pub created_at: String,
    pub updated_at: String,
}
```

---

## 4. Theme System Architecture

The theme engine is implemented in [`src/context/ThemeContext.tsx`](file:///home/royalrohan/Documents/veylock/src/context/ThemeContext.tsx) and driven by CSS variables in [`src/index.css`](file:///home/royalrohan/Documents/veylock/src/index.css):

```text
User Selects (Dark / Light / System)
                │
                ▼
      ThemeContext.setTheme()
                │
    ┌───────────┴───────────┐
    ▼                       ▼
localStorage           DOM Attribute
'veylock_theme_preference'   document.documentElement['data-theme']
                            │
                            ▼
                    CSS Variables:
                    --bg-app, --bg-surface,
                    --text-main, --text-muted,
                    --border-color
```

When set to `system`, a listener dynamically reacts to changes in `window.matchMedia('(prefers-color-scheme: dark)')`.

---

## 5. Dual-Save File Export Architecture

To overcome restrictive OS sandboxing (especially in Android WebViews and containerized Linux desktops), Veylock uses a triple-redundant export pipeline:

1. **Rust Direct Filesystem Write**: Resolves native system paths (`/storage/emulated/0/Download`, `download_dir()`, `document_dir()`) and writes the file directly.
2. **HTML5 Blob Trigger**: Concurrently synthesizes a client-side `Blob` and triggers a native browser download (`<a download="...">`).
3. **One-Click Clipboard Backup**: The export success modal provides a direct "Copy to Clipboard" fallback so users never lose exported data.

---

## 6. Tauri IPC Command Layer

* `get_vault_status`: Query whether a vault database exists and is currently unlocked.
* `create_vault`: Initialize new Argon2id parameters, master key wrapper, and database.
* `unlock_vault`: Verify master password and unwrap VEK into memory.
* `lock_vault`: Purge session keys and zeroize RAM buffers.
* `get_entries`: Decrypt and return all stored vault items.
* `save_entry`: Encrypt item payload and write to SQLite.
* `delete_entry`: Delete record by ID from SQLite.
* `generate_password`: Generate CSPRNG passwords or BIP39 passphrases.
* `generate_totp_code`: Calculate current TOTP token with configurable digits and time periods.
* `validate_totp`: Validate Base32 secret encoding and algorithm parameters with zeroization.
* `copy_to_clipboard_secure`: Copy text to clipboard and schedule a 30-second wipe.
* `touch_user_activity`: Refresh inactivity keepalive timer.
* `export_vault_backup` / `export_vault_backup_string`: Export encrypted `.vlock` archive.
* `import_vault_backup`: Restore vault from `.vlock` archive.
* `export_plaintext_csv` / `export_plaintext_csv_string`: Export sanitized CSV spreadsheet.
* `import_plaintext_csv`: Import credentials from standard CSV formats.

