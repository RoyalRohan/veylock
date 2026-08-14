# Veylock

<p align="center">
  <strong>Your secrets. Your device. Your control.</strong><br>
  A privacy-first, local-only password manager for Windows and Linux.
</p>

---

## Overview

**Veylock** is a production-quality, open-source, cross-platform desktop password manager built around a fundamental principle:

> **Your credentials belong to you. They should remain under your control.**

Veylock is a native desktop application for **Linux and Windows** powered by **Tauri 2**, **Rust**, **SQLite**, and **React**. It operates 100% offline, requires no account, requires no remote server, and collects zero telemetry or credentials.

---

## Core Product Philosophy

* **Local-First**: Your encrypted vault lives exclusively on your local device or your designated storage.
* **Offline-First**: Fully functional without an active Internet connection.
* **No Mandatory Account**: Zero sign-ups, emails, usernames, subscriptions, or central accounts.
* **No Telemetry / No Cloud**: Zero transmission of master passwords, credentials, logs, or analytics.
* **Open Source & Auditable**: Built with standard, highly vetted cryptographic libraries (`argon2`, `aes-gcm`, `zeroize`).

---

## Security Architecture & Threat Model

Veylock enforces envelope encryption and zero-trust memory management:

```text
Master Password (User Input)
       │
       ▼
   Argon2id KDF (m=64MB, t=3, p=4, 16-byte random salt)
       │
       ▼
Key Encryption Key (KEK, 256-bit)
       │
       ▼
Decrypt Wrapped Vault Encryption Key (VEK, 256-bit CSPRNG)
       │
       ▼
AES-256-GCM (96-bit random nonce per record)
       │
       ▼
Encrypted Payload (Saved in SQLite / `.vlock` portable archive)
```

### Protection Summary
- **Data at Rest**: SQLite stores only AEAD encrypted payloads with unique nonces. Plaintext credentials are never indexed or saved to disk.
- **Master Password Handling**: The master password is never stored anywhere on disk, database, logs, or memory after key derivation.
- **Lock & Memory Zeroization**: When locked, Rust zeroizes sensitive key structures in RAM using the `zeroize` crate.
- **Clipboard Guard**: Copied secrets overwrite the clipboard automatically after a configurable timer (default 30s).

*(For a comprehensive analysis of environmental threats like host OS malware and cold boot attacks, see [`THREAT_MODEL.md`](./THREAT_MODEL.md).)*

---

## Key Features

1. **Vault Lifecycle Management**:
   - Master Password setup & confirmation with Argon2id parameters.
   - Manual Lock button and configurable Auto-Lock timers (1m, 5m, 10m, 15m, 30m, Never).
2. **Credential & Secret Organization**:
   - Web Logins, Passwords, Usernames, URLs, Notes, Custom Fields (Sensitive & Normal).
   - Dedicated Secure Notes module.
   - Categories, Tags, and Favorites.
3. **Built-in Password Generator**:
   - CSPRNG random generation with custom length, uppercase, lowercase, numbers, symbols, ambiguous character exclusion, and passphrase modes.
   - Integrated password strength visual indicator.
4. **Built-in Offline TOTP Authenticator**:
   - RFC 6238 compliant 2-Factor OTP calculator with active countdown timers.
5. **Security & Health Dashboard**:
   - Local vault health scoring (detecting weak passwords, reused passwords, old entries, missing TOTP).
   - Local password reuse detection without external hash lookups.
6. **Backup, Import & Export**:
   - Portable Encrypted Vault Archives (`.vlock`) for USB/Local storage migration.
   - CSV Plaintext Import and Export with explicit security warnings.
7. **Keyboard Navigation & System Integration**:
   - `Ctrl/Cmd + K` Quick Search, `Ctrl/Cmd + N` New Entry, `Ctrl/Cmd + L` Lock Vault, `Ctrl/Cmd + G` Password Generator.

---

## Building Veylock

### Prerequisites
* **Node.js**: v18+ and `npm`
* **Rust**: 1.75+ (`rustc` and `cargo`)
* **Linux Dependencies** (Ubuntu/Debian):
  ```bash
  sudo apt install build-essential pkg-config libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev
  ```

### Development
```bash
# Clone the repository
git clone https://github.com/veylock/veylock.git
cd veylock

# Install Node dependencies
npm install

# Run application in development mode
npm run tauri dev
```

### Packaging & Distribution
```bash
# Build desktop executable (.AppImage / .deb on Linux, .exe / .msi on Windows)
npm run tauri build
```

---

## Project Structure & Documentation

* [`SECURITY.md`](./SECURITY.md) — Vulnerability reporting and security boundaries.
* [`THREAT_MODEL.md`](./THREAT_MODEL.md) — Threat model and cryptographic bounds.
* [`PRIVACY.md`](./PRIVACY.md) — Privacy commitments and offline guarantee.
* [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Structural diagrams, IPC design, and schema definitions.
* [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Development workflow and contribution rules.
* [`CHANGELOG.md`](./CHANGELOG.md) — Version history and release notes.
* [`LICENSE`](./LICENSE) — MIT Open Source License.

---

## License

Veylock is released under the **MIT License**.
