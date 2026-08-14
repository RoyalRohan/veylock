# Veylock Changelog

All notable changes to Veylock will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
