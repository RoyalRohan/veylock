# Veylock Changelog

All notable changes to Veylock will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-04

### Added
- **7 Specialized Item Form Editors**: Replaced the generic item editor with domain-specific forms:
  - `LoginForm`: Web credentials, URL launcher, password entropy/crack time, and embedded TOTP.
  - `SecureNoteForm`: Distraction-free multi-line document editor with word/line counts.
  - `AuthenticatorForm`: Standalone RFC 6238 2FA manager with live test verification.
  - `CardForm`: Payment card editor with auto-chunking and live brand detection (Visa, Mastercard, Amex, Discover).
  - `LicenseForm`: Software serial key editor with validity dates and publisher metadata.
  - `ServerForm`: Server/SSH manager with protocol selector and multi-line private key support.
  - `ApiCredentialForm`: Developer API credentials with environment badges and OAuth secrets.
- **7 Dedicated Detail Renderers**: Type-tailored visual views in `EntryDetail.tsx` (embossed credit card preview, connection string copy, hero TOTP code displays, and formatted license blocks).
- **Reusable Atomic UI Primitives**: Extracted `SecretInput`, `CopySecretButton`, `PasswordField`, `TagEditor`, `CustomFieldsEditor`, `FormSection`, and `EntryFormShell`.
- **Global Tri-State Theme Engine**: Dynamic CSS design tokens supporting **Obsidian Dark**, **Clean Slate Light**, and **System mode** (following `prefers-color-scheme`), persisted in localStorage.
- **Hardened TOTP Validation Engine**: Added `validate_totp` backend command with memory-zeroized Base32 decoding, 6/8 digit tokens, and 30s/60s intervals.
- **Shannon Entropy Engine**: Real-time entropy scoring (bits) and crack-time estimator embedded in credential details, password generator, and setup modals.
- **Dual-Save File Export System**: Redundant export pipeline combining Rust native filesystem write, HTML5 Blob download, and a one-click clipboard backup.
- **Interactive Tag Chip Editor**: Dynamic tag chip creation (via Enter or comma) and deletion in credential editor, with badges rendered in list and detail views.
- **Interactive Security Dashboard Tabs**: Filter tabs ("All", "Weak", "Reused", "Missing 2FA") with live badge counters and instant one-click "Fix" action.
- **Caps Lock Detection & Shake Animation**: Caps Lock alert banner on master password fields and animated error shake feedback.
- **Activity Keepalive Auto-Lock Guard**: User activity IPC ping (`touch_user_activity`) to prevent premature auto-lock while actively browsing.
- **Complete Mobile Responsiveness**: Adaptive single-column drilldown (List ➔ Detail with back navigation), off-canvas sidebar drawer, quick-access mobile bottom navigation bar, and responsive touch-optimized modals (min. 44px touch targets).
- **Fedora RPM & Android APK Distribution**: Added native Fedora Linux (`.rpm`) packaging and automated Android ARM64 (`.apk`) build, sign, and release pipeline.
- **Quick Keyboard Shortcuts Cheatsheet**: Shortcut badges (`⌘N`, `⌘K`, `⌘G`, `⌘L`, `Esc`) in Header and empty detail pane.

### Fixed
- **Monolithic Generic Item Form**: Replaced generic modal that treated all items as simple username/password records with dedicated type-specific forms.
- **100% Backward Compatibility**: Added Serde default deserialization so all existing vaults and backups decrypt without error or schema migration.
- **Premature Auto-Lock**: Resolved issue where reading or browsing entries caused the backend timer to unexpectedly lock the vault.
- **Category Filter Reset Bug**: Fixed state loss when editing or saving credentials from specific categories.
- **CSV Formula Injection Sanitization**: Prevented CSV injection vulnerabilities (`=`, `+`, `-`, `@`) without stripping legitimate apostrophes from passwords or titles.
- **Directory Resolution on Export**: Added recursive `fs::create_dir_all` to prevent filesystem crashes when exporting backups or CSVs to non-existent folders.
- **Tag Data Retention**: Resolved bug where saving an entry wiped existing tags.
- **Tauri Path Capability**: Added `core:path:default` capability to permissions for reliable OS directory resolution.
- **Password Generator Character Set Guard**: Prevented unchecking all character sets in CSPRNG password generation.
- **TypeScript Compilation Errors**: Resolved all type mismatches in modal components and crypto utility functions (0 compiler errors).

## [1.0.0] - 2026-08-14

### Added
- **Local-First Cryptographic Core**: Envelope key management using Argon2id key derivation and AES-256-GCM authenticated encryption.
- **Tauri 2 Desktop Integration**: Native builds for Windows (.exe/.msi) and Linux (.AppImage/.deb).
- **Encrypted SQLite Database Engine**: Zero plaintext credential storage at rest.
- **Lock & Auto-Lock Security**: Manual lock and auto-lock timers (1 min, 5 min, 10 min, 15 min, 30 min, Never). Memory key zeroization on lock.
- **Secure Password Generator**: CSPRNG password generation with length, character sets, symbol exclusion, and passphrase modes.
- **Built-in TOTP Authenticator**: Offline 2-Factor OTP calculation (RFC 6238).
- **Clipboard Guard**: Timed clipboard clearing (15s, 30s, 60s, Never).
- **Vault Security Dashboard**: Local password health audit, weak password detection, duplicate/reused password detection, and TOTP coverage scoring.
- **Encrypted Vault Archives**: Portable `.vlock` export/restore and CSV import/export with explicit user warnings.
- **Custom Fields & Categories**: Support for sensitive/normal custom fields, secure notes, favorites, tags, and category sorting.
- **Keyboard Shortcuts**: `Ctrl+K` (Search), `Ctrl+N` (New Entry), `Ctrl+L` (Lock), `Ctrl+G` (Generator).
