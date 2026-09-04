# Veylock Changelog

All notable changes to Veylock will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-04

### Added
- **Shannon Entropy Engine**: Real-time entropy scoring (bits) and crack-time estimator embedded in credential details, password generator, and setup modals.
- **Interactive Tag Chip Editor**: Dynamic tag chip creation (via Enter or comma) and deletion in credential editor, with badges rendered in list and detail views.
- **Interactive Security Dashboard Tabs**: Filter tabs ("All", "Weak", "Reused", "Missing 2FA") with live badge counters and instant one-click "Fix" action.
- **Caps Lock Detection & Shake Animation**: Caps Lock alert banner on master password fields and animated error shake feedback.
- **Obsidian & Sapphire Glass UI**: Redesigned dark aesthetic with ambient glows, glassmorphism panels, and custom minimalist dark scrollbars.
- **Activity Keepalive Auto-Lock Guard**: User activity IPC ping (`touch_user_activity`) to prevent premature auto-lock while actively browsing.
- **Fedora RPM & Android APK Distribution**: Added native Fedora Linux (`.rpm`) packaging and automated Android ARM64 (`.apk`) build, sign, and release pipeline.
- **Quick Keyboard Shortcuts Cheatsheet**: Shortcut badges (`⌘N`, `⌘K`, `⌘G`, `⌘L`, `Esc`) in Header and empty detail pane.

### Fixed
- **Premature Auto-Lock**: Resolved issue where reading or browsing entries caused the backend timer to unexpectedly lock the vault.
- **Category Filter Reset Bug**: Fixed state loss when editing or saving credentials from specific categories.
- **CSV Formula Injection Sanitization**: Prevented CSV injection vulnerabilities (`=`, `+`, `-`, `@`) without stripping legitimate apostrophes from passwords or titles.
- **Directory Resolution on Export**: Added recursive `fs::create_dir_all` to prevent filesystem crashes when exporting backups or CSVs to non-existent folders.
- **Tag Data Retention**: Resolved bug where saving an entry wiped existing tags.
- **Tauri Path Capability**: Added `core:path:default` capability to permissions for reliable OS directory resolution.
- **Password Generator Character Set Guard**: Prevented unchecking all character sets in CSPRNG password generation.
- **TypeScript Compilation Errors**: Resolved all type mismatches in modal components and crypto utility functions.

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
