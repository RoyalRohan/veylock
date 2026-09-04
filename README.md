<p align="center">
  <img src="public/logo.png" alt="Veylock Official Logo" width="120" height="120" style="border-radius: 26px; box-shadow: 0 12px 30px rgba(6, 182, 212, 0.25);" />
</p>

<h1 align="center">Veylock</h1>

<p align="center">
  <strong>Offline-First, Zero-Trust, Local-Only Password & Credential Manager</strong><br>
  <em>Engineered for Linux, Windows, and Android</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Tauri-2.x-24C8D8.svg?logo=tauri&logoColor=white" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/Rust-1.75+-orange.svg?logo=rust&logoColor=white" alt="Rust 1.75+" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB.svg?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind-CSS_4-38BDF8.svg?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Security-Argon2id_%2B_AES--256--GCM-emerald.svg" alt="Argon2id + AES-256-GCM" />
</p>

---

## Overview

**Veylock** is a high-security, local-first credential and password manager built to keep your sensitive data exclusively under your ownership. It operates with **zero cloud synchronization**, **zero telemetry**, and **zero external network requests**. 

Combining **Tauri 2**, **Rust**, **React 19**, **SQLite**, and **Tailwind CSS 4**, Veylock delivers native performance, hardware-enforced memory safety, and an elegant tri-state interface that seamlessly transitions between **Obsidian Dark**, **Clean Slate Light**, and **System-adaptive** modes.

---

## Core Security & Architecture Principles

* **100% Offline by Design**: Operates entirely without an internet connection. Credentials, notes, cards, and server keys never leave your device.
* **Dual-Key Envelope Cryptography**: Master passwords derive a Key Encryption Key (KEK) via memory-hard Argon2id, which unwrap a random 256-bit Vault Encryption Key (VEK) stored in memory.
* **Memory Zeroization**: Secret buffers in RAM (passwords, encryption keys, and decoded TOTP secrets) are zeroized on drop using Rust's `zeroize` crate upon vault lock or window close.
* **Zero Telemetry & Tracking**: No Google Analytics, no Sentry, no telemetry pings, and no external font CDNs (all typefaces are bundled locally).
* **Auditable Standard Primitives**: Built exclusively with peer-reviewed cryptographic libraries (`ring`, `argon2`, `aes-gcm`, `rand_core`).

---

## Specialized Item Types

Veylock replaces one-size-fits-all credential forms with **7 dedicated domain-specific editors and visual detail layouts**:

| Item Type | Icon | Dedicated Capabilities & Fields |
| :--- | :---: | :--- |
| **Logins** | 🔑 | Web credentials, URL launcher, password entropy & crack-time analysis, embedded 2FA TOTP token with countdown timer, secure notes, tags, and custom fields. |
| **Secure Notes** | 📝 | Distraction-free multi-line document editor for recovery keys, seed phrases, confidential memos, word/line count metrics, and one-click full copy. |
| **2FA Authenticators** | ⏱️ | Standalone RFC 6238 TOTP replacement with Base32 secret key validation, configurable token length (6 or 8 digits), custom time steps (30s or 60s), SHA-1/SHA-256 algorithm support, and live code test preview. |
| **Payment Cards** | 💳 | Cardholder name, auto-chunked 16-digit card number, live network identification (Visa, Mastercard, Amex, Discover), expiration dropdowns, masked CVV/PIN reveals, and billing address. |
| **Software Licenses** | 📜 | Monospace license serial key block, publisher, edition/version, licensed user email, validity dates, order reference, and purchase link. |
| **Servers & SSH** | 🖥️ | Protocol selector (SSH, SFTP, FTP, RDP, MySQL, PostgreSQL, Redis, HTTP, HTTPS), host/IP, port, credentials, multi-line private SSH key viewer, and one-click connection string copy (`ssh user@host -p 22`). |
| **API Credentials** | ⚡ | Service header, environment badge (Production, Staging, Development, Test), base endpoint URL, masked API Key, Secret Token, Client ID, and Client Secret. |

---

## Cryptographic Key Hierarchy

```text
[Master Password] + Random Salt (16 bytes)
                 │
                 ▼
          Argon2id KDF
  (m=64MB, t=3, p=4, out=32B)
                 │
                 ▼
     Key Encryption Key (KEK)
                 │
                 ▼
  AES-256-GCM Unwrapping of 256-bit
     Vault Encryption Key (VEK)
                 │
                 ▼
  Decrypted VEK in RAM (Zeroized on Lock)
                 │
                 ▼
  AES-256-GCM Encryption / Decryption
      (Unique 96-bit Nonce per entry)
                 │
                 ▼
  Local SQLite Database (`vault.sqlite`)
```

* **Argon2id Parameters**: 64 MB memory cost, 3 time iterations, 4 parallelism threads, defending against GPU and ASIC-accelerated brute-force attacks.
* **AES-256-GCM AEAD**: Authenticated Encryption with Associated Data ensures that any bit-flip or database tampering immediately fails decryption.
* **Database Format**: Local SQLite database with encrypted binary JSON payloads. Schema additions are 100% backward compatible via default deserialization.

---

## Key Features

### 1. Tri-State Theme Engine (Dark / Light / System)
* **Obsidian Dark**: Signature deep slate and sapphire aesthetic with subtle glows and glassmorphism.
* **Clean Slate Light**: High-contrast, clean slate surfaces designed for bright daylight environments.
* **System Mode**: Dynamically follows your operating system's color scheme (`prefers-color-scheme`) via real-time media query listeners.
* Persisted reliably in local storage and switchable in Settings with a single click.

### 2. Shannon Entropy & Crack-Time Estimator
Real-time entropy calculations (bits) and realistic crack-time estimates (from *Instant* to *Trillions of Years*) embedded directly into credential cards, password generator sliders, and vault setup.

### 3. CSPRNG Password & Passphrase Generator
* **Random Mode**: Configurable length (8 to 64 chars) with length presets (16, 20, 24, 32, 48), character pool toggles (Uppercase, Lowercase, Numbers, Symbols), and ambiguous character exclusion (`1`, `l`, `I`, `0`, `O`, `8`).
* **Passphrase Mode**: BIP39-based multi-word generation (3 to 8 words) with customizable word separators.

### 4. Dual-Save Reliable Backup & Export
* **Encrypted Backups (`.vlock`)**: Full AES-256-GCM portable snapshots of your entire vault.
* **CSV Export**: Sanitized spreadsheet format with CSV formula injection mitigation (`=`, `+`, `-`, `@`).
* **Dual-Save Architecture**: Directly writes to your system Downloads/Documents directory while simultaneously triggering a native browser download and offering a one-click clipboard fallback.

### 5. Interactive Security Health Audit
Live dashboard auditing your entire database:
* Identifies weak passwords with low complexity or entropy.
* Detects reused passwords across different accounts.
* Highlights accounts missing two-factor authentication (TOTP).
* Quick filter tabs ("All", "Weak", "Reused", "Missing 2FA") with one-click "Fix" actions.

### 6. Mobile & Desktop Ergonomics
* Minimum 44px touch targets across all buttons, inputs, and toggles.
* Safe-area insets (`pt-safe`, `pb-safe`) for notched smartphones and gesture navigation bars.
* Single-column adaptive drilldown on mobile screens with smooth back navigation.
* Quick-action bottom bar on smartphones and collapsible sidebar on tablets and desktops.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>N</kbd> / <kbd>Ctrl</kbd> + <kbd>N</kbd> | Create new vault item |
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Focus instant search |
| <kbd>⌘</kbd> + <kbd>G</kbd> / <kbd>Ctrl</kbd> + <kbd>G</kbd> | Open Password Generator |
| <kbd>⌘</kbd> + <kbd>L</kbd> / <kbd>Ctrl</kbd> + <kbd>L</kbd> | Lock vault immediately |
| <kbd>Esc</kbd> | Dismiss search / close active modal |

---

## Installation & Building from Source

### Prerequisites

* **Node.js**: v20+ and `npm`
* **Rust**: `rustc` and `cargo` v1.75+ ([rustup.rs](https://rustup.rs/))
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

### Step-by-Step Build Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RoyalRohan/veylock.git
   cd veylock
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Run in Web Preview Mode** (Frontend mock — No Rust required):
   ```bash
   npm run dev
   ```

4. **Run Native Desktop Application in Development Mode**:
   ```bash
   npm run tauri dev
   ```

5. **Run Verification & Test Suites**:
   ```bash
   # Typecheck frontend
   npx tsc --noEmit

   # Build frontend production bundle
   npm run build

   # Run backend cryptographic test suite
   cd src-tauri && cargo test
   ```

6. **Compile Production Packages**:
   ```bash
   npm run tauri build
   ```
   * **Linux**: Generates `.deb`, `.rpm`, and `.AppImage` in `src-tauri/target/release/bundle/`
   * **Windows**: Generates `.exe` installer (NSIS) in `src-tauri/target/release/bundle/nsis/`
   * **Android**: Generates `.apk` via `npm run tauri android build --apk`

---

## Documentation Links

* [`ARCHITECTURE.md`](./ARCHITECTURE.md) — IPC layer, envelope cryptography, data models, and database schema.
* [`SECURITY.md`](./SECURITY.md) — Security disclosures, responsible reporting, and memory protection guarantees.
* [`THREAT_MODEL.md`](./THREAT_MODEL.md) — Threat boundaries, attack vectors, mitigations, and out-of-scope assumptions.
* [`PRIVACY.md`](./PRIVACY.md) — Zero-telemetry policy, local storage guarantees, and offline specification.
* [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Development setup, contribution workflows, and coding standards.
* [`CHANGELOG.md`](./CHANGELOG.md) — Chronological release history.

---

## License

Veylock is free and open-source software licensed under the **[MIT License](./LICENSE)**.
