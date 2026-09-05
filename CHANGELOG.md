# Changelog

All notable changes to Veylock are documented here.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-09-04

### Added

- Seven specialized item editors: Login, Secure Note, Authenticator, Card, License, Server, and API Credential.
- Seven item-specific detail renderers.
- Reusable secret, copy, password, tagging, form-section, and form-shell UI primitives.
- Dark, Light, and System theme support with persisted preference.
- Stronger TOTP validation and configurable token generation.
- Shannon-entropy scoring and crack-time estimates for passwords.
- Encrypted `.vlock` backup export and restore improvements.
- Interactive tags and security-health filtering.
- Caps Lock detection and improved master-password error feedback.
- Activity keepalive to reduce unintended auto-locks while the user is active.
- Responsive mobile navigation, touch-friendly targets, and mobile drill-down flows.
- Fedora RPM and Android APK release packaging.
- Keyboard shortcut hints in the desktop interface.

### Fixed

- Replaced the monolithic generic entry editor with type-specific forms.
- Preserved compatibility with existing vaults and backups through additive deserialization.
- Fixed premature auto-lock while browsing entries.
- Fixed category filter state being lost during saves.
- Added CSV formula-injection sanitization.
- Improved export directory creation and path handling.
- Preserved tags when editing entries.
- Added required Tauri path capability for reliable directory resolution.
- Prevented invalid empty character pools in the password generator.
- Resolved TypeScript compilation errors in affected UI and crypto utilities.

## [1.0.0] — 2026-08-14

### Added

- Local-first vault architecture with Argon2id and AES-256-GCM.
- Tauri 2 desktop application.
- Encrypted SQLite persistence.
- Manual and automatic vault locking.
- Password and passphrase generation.
- Offline RFC 6238 TOTP generation.
- Timed clipboard clearing.
- Vault security health checks.
- Encrypted `.vlock` backups and CSV import/export.
- Custom fields, categories, favorites, and tags.
- Desktop keyboard shortcuts.
