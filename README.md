# Veylock

> **Offline-first, zero-trust, local-only password manager built for Windows, Linux, and Android.**

Veylock is engineered to keep your credentials completely under your control with **zero cloud synchronization**, **zero telemetry**, and **zero external network requests**. 

Built on top of **Tauri 2**, **Rust**, **React 19**, **SQLite**, and **Tailwind CSS 4**, Veylock provides a lightweight native desktop container with high-performance cryptographic operations and a modern **Obsidian & Sapphire Glass** dark user interface.

---

## Core Principles

* **100% Local-Only**: Your database lives exclusively on your local device. Credentials never cross network boundaries.
* **Zero Knowledge**: Your master password is never stored on disk. It derives encryption keys at runtime that are zeroized from memory when locked.
* **Zero Telemetry**: No analytics, no tracking, no crash reporting, and zero external pings.
* **Auditable Cryptography**: Built with standard, thoroughly-vetted cryptographic implementations (`argon2` for key derivation, `aes-gcm` for authenticated encryption, and `zeroize` for RAM memory safety).

---

## Security Design

Veylock implements a dual-key envelope encryption architecture:

```
[Master Password] ───> Argon2id KDF ───> [Key Encryption Key (KEK)]
                                                     │
                                                     ▼
[Vault Encryption Key (VEK)] <────────────── Decrypts Wrapped Key
             │
             ▼
    AES-256-GCM Encryption
 (Unique 96-bit Nonce per entry)
             │
             ▼
 [SQLite Encrypted Payload]
```

* **Key Derivation (KDF)**: Argon2id (64MB memory, 3 iterations, 4 parallelism threads) to protect against GPU and ASIC-based brute-force attacks.
* **Envelope Encryption**: All credential payload fields (passwords, usernames, URLs, notes, custom fields, tags) are serialized and encrypted together as a single binary payload before writing to SQLite.
* **Memory Protection**: The active Vault Encryption Key (VEK) and decrypted material are held in memory using `zeroize`, instantly zeroing RAM buffers upon vault lock or window close.
* **Smart Auto-Lock & Clipboard Guard**: Configurable inactivity timers (1m, 5m, 10m, 15m, 30m, Never) with active browsing keepalive, and automated clipboard clearing (30s) or immediate purge on lock.
* **Caps Lock & Error Alerts**: Real-time Caps Lock detection banner on master password entry and micro-animated error shake feedback.

---

## Key Features

1. **Obsidian & Sapphire Glass UI**: Polished dark theme with custom glass panels, subtle ambient glows, and responsive split-pane navigation.
2. **Shannon Entropy Engine**: Real-time entropy score (bits) and realistic crack-time estimates (`~2,000 years`, `Decades`, `Instant`) embedded into credential views, the password generator, and vault setup.
3. **CSPRNG Password & Passphrase Generator**: Generate cryptographically secure passwords with custom character sets (with empty-pool protection), length presets (16, 20, 24, 32, 48), and BIP39-based multi-word passphrases.
4. **Built-in TOTP Authenticator**: Offline Two-Factor Authentication (RFC 6238 compliant) with live countdown progress rings and instant one-click copying.
5. **Interactive Security Health Audit**: Local audit dashboard highlighting weak passwords, reused credentials, and missing 2FA keys, complete with filter tabs and one-click "Fix" actions.
6. **Tag Chip System & Custom Fields**: Organize credentials using interactive tag chips, and store arbitrary encrypted key-value pairs (with masked/revealed toggle for sensitive values).
7. **Hardened Import & Export**:
   * Portable encrypted backups (`.vlock`) with automatic directory resolution.
   * Plaintext CSV export with CSV formula injection protection (`=`, `+`, `-`, `@`) and folder auto-creation.
8. **Keyboard Shortcuts**:
   * `⌘N` / `Ctrl+N` : Create new credential
   * `⌘K` / `Ctrl+K` : Quick search
   * `⌘G` / `Ctrl+G` : Open password generator
   * `⌘L` / `Ctrl+L` : Lock vault
   * `Esc` : Clear search / close modal

---

## Getting Started & Building from Source

### Prerequisites

* **Node.js**: v20+ and `npm`
* **Rust Toolchain**: `rustc` and `cargo` v1.75+ ([Install Rust via rustup](https://rustup.rs/))
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  source "$HOME/.cargo/env"
  ```

#### Linux System Packages

* **Fedora / RHEL**:
  ```bash
  sudo dnf install gcc gcc-c++ webkit2gtk4.1-devel openssl-devel curl wget
  ```

* **Ubuntu / Debian**:
  ```bash
  sudo apt update && sudo apt install build-essential pkg-config libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev curl wget
  ```

* **Arch Linux**:
  ```bash
  sudo pacman -S --needed base-devel webkit2gtk-4.1 openssl curl wget
  ```

---

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RoyalRohan/veylock.git
   cd veylock
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Run in Web Preview Mode** (Frontend only — No Rust required):
   ```bash
   npm run dev
   ```
   *Serves on `http://localhost:1420`*

4. **Run Native Desktop App in Development Mode**:
   ```bash
   npm run tauri dev
   ```

5. **Compile Production Release Bundle**:
   ```bash
   npm run tauri build
   ```
    * **Linux**: Generates `.deb` (Ubuntu/Debian) and `.rpm` (Fedora/RHEL/openSUSE) in `src-tauri/target/release/bundle/`
    * **Windows**: Generates `.exe` installer (NSIS) in `src-tauri/target/release/bundle/nsis/`
    * **Android**: Generates `.apk` package via `npm run tauri android build --apk`

---

## Project Documentation

* [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Technical architecture and data flow.
* [`SECURITY.md`](./SECURITY.md) — Security policies and vulnerability disclosures.
* [`THREAT_MODEL.md`](./THREAT_MODEL.md) — Threat vectors, mitigations, and boundaries.
* [`PRIVACY.md`](./PRIVACY.md) — Local execution guarantees and privacy specs.
* [`CHANGELOG.md`](./CHANGELOG.md) — Detailed version history.

---

## License

Veylock is released under the **MIT License**.
