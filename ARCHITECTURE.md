# Veylock Architecture Documentation

This document explains the software architecture, IPC boundaries, key management, database storage model, and UI integration of Veylock.

---

## 1. System High-Level Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                      React / TS Renderer                    │
│                                                             │
│   • LockScreen / VaultSetup                                 │
│   • Credential Manager & Detail View                        │
│   • Password Generator & TOTP Display                       │
│   • Security Health Dashboard                               │
└──────────────┬──────────────────────────────────────────────┘
               │  Tauri IPC Invoke (JSON-RPC)
┌──────────────▼──────────────────────────────────────────────┐
│                    Tauri / Rust Backend                     │
│                                                             │
│  ├── VaultManager (Session state, auto-lock timer)          │
│  ├── Crypto Engine (Argon2id, AES-256-GCM, Zeroize)         │
│  ├── SQLite Engine (rusqlite)                               │
│  ├── Clipboard Guard (Timed auto-clear)                     │
│  └── TOTP Engine (Offline RFC 6238 generation)              │
└──────────────┬──────────────────────────────────────────────┘
               │  AES-256-GCM Encrypted Data
┌──────────────▼──────────────────────────────────────────────┐
│                    Local Persistence                        │
│   • `vault.sqlite` (Local device storage)                   │
│   • `.vlock` (Portable encrypted vault backup file)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Envelope Cryptography & Key Hierarchy

To enable efficient master password updates without re-encrypting every vault item individually, Veylock utilizes an envelope key derivation scheme:

```text
Master Password + Random Salt (16 bytes)
                 │
                 ▼
            Argon2id KDF
(m=64MB, t=3, p=4, output_len=32)
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
AES-256-GCM Encryption / Decryption of Payload Records
```

---

## 3. Database & Payload Storage

Sensitive payloads are JSON strings containing entry fields (Username, Password, Notes, TOTP Secret, Custom Fields) serialized and encrypted into `nonce` and `encrypted_payload` byte arrays.

### Table Schema

```sql
CREATE TABLE IF NOT EXISTS vault_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'logins',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_used_at TEXT,
    nonce BLOB NOT NULL,
    encrypted_payload BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT
);
```

---

## 4. Tauri IPC Command Layer

All interactions between the frontend React application and the native Rust layer take place over Tauri IPC commands:

* `get_vault_status`: Query whether a vault is initialized and unlocked.
* `create_vault`: Initialize new Argon2id parameters, VEK wrapper, and database.
* `unlock_vault`: Verify master password, unwrap VEK into session memory.
* `lock_vault`: Purge session keys and reset lock status.
* `get_entries`: Retrieve headers and decrypt active vault items.
* `save_entry`: Encrypt item payload and persist to SQLite.
* `delete_entry`: Remove record from SQLite.
* `generate_password`: Generate CSPRNG random passwords.
* `generate_totp_code`: Calculate 6-digit TOTP code for a secret.
* `copy_to_clipboard_secure`: Copy text and schedule auto-clear wiping.
* `export_vault_backup`: Export portable encrypted `.vlock` backup.
* `import_vault_backup`: Restore from portable `.vlock` file.
