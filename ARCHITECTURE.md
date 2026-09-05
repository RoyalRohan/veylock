# Veylock Architecture

This document describes the main boundaries and data flows of Veylock. It is intentionally implementation-oriented so contributors can understand where UI, IPC, storage, and cryptography meet.

## 1. System overview

```text
┌──────────────────────────────────────────────────────────────┐
│                    React / TypeScript UI                    │
│                                                              │
│  Lock Screen · Vault · Theme Context                         │
│  7 Item Editors · Detail Views · Generator · Health          │
└────────────────────────────┬─────────────────────────────────┘
                             │ Tauri IPC
┌────────────────────────────▼─────────────────────────────────┐
│                       Rust / Tauri                           │
│                                                              │
│  Vault session · Crypto · SQLite · Clipboard · TOTP          │
│  Backup / restore · Import / export                          │
└────────────────────────────┬─────────────────────────────────┘
                             │ encrypted payloads
┌────────────────────────────▼─────────────────────────────────┐
│                    Local persistence                          │
│  vault.sqlite · encrypted .vlock backups                     │
└──────────────────────────────────────────────────────────────┘
```

The renderer contains the lock/setup flow, theme engine, seven specialized item form editors, seven dedicated detail renderers, password generation, and security-health views. fileciteturn0file0L7-L20

## 2. Item model

Veylock currently uses an additive decrypted model. Item-specific properties remain optional so older databases and backup payloads can continue to deserialize without a destructive migration.

The current model contains fields for logins, TOTP, cards, licenses, servers, API credentials, custom fields, tags, and favorites. fileciteturn0file0L96-L176

This approach favors backward compatibility over splitting every category into a separate SQLite table.

## 3. Storage

The application stores metadata in SQLite and keeps sensitive entry content inside an encrypted payload. The documented table contains an entry identifier, category, favorite flag, encrypted payload, and timestamps. fileciteturn0file0L74-L92

Portable backups use the `.vlock` extension and preserve encrypted vault data. fileciteturn0file0L33-L37

## 4. Key hierarchy

The documented key hierarchy is:

```text
Master password + random salt
           │
           ▼
        Argon2id
           │
           ▼
 Key Encryption Key (KEK)
           │
           ▼
   unwrap random VEK
           │
           ▼
 Vault Encryption Key (VEK)
           │
           ▼
     AES-256-GCM
           │
           ▼
 encrypted item payloads
```

The current documented parameters are Argon2id with 64 MB memory, time cost 3, parallelism 4, and a 16-byte random salt; AES-256-GCM uses a unique random nonce for each entry. fileciteturn0file0L43-L69

## 5. Runtime security boundary

The React renderer communicates with the Rust core through Tauri IPC. Rust owns vault state, key material, SQLite operations, TOTP generation/validation, clipboard protection, and backup operations. fileciteturn0file0L220-L235

The active Vault Encryption Key is kept in memory only while the vault is unlocked and is intended to be zeroized during lock/close operations. fileciteturn0file0L69-L70

## 6. Theme system

The theme system is implemented through `ThemeContext` and CSS variables. The supported modes are:

- Dark
- Light
- System

The selected preference is stored in `localStorage`, applied through a root `data-theme` attribute, and System mode reacts to the operating system's `prefers-color-scheme` media query. fileciteturn0file0L182-L204

## 7. Export and import

Veylock exposes commands for encrypted vault backup export/import and sanitized CSV export/import. The current command layer includes both native backup operations and string-based export helpers. fileciteturn0file0L220-L235

On platforms with filesystem restrictions, the implementation may combine native and browser-side download mechanisms. Backup UX should always make the resulting file user-accessible and should never treat private application storage as the only copy.

## 8. Development principles

When changing the architecture:

- preserve existing encrypted data;
- keep IPC contracts explicit;
- prefer additive serialization changes;
- do not move cryptographic responsibilities into the renderer without a strong reason;
- avoid logging sensitive values;
- test backup/restore after data-model changes;
- keep UI item types specialized without duplicating low-level security primitives.
