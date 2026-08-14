# Veylock

Veylock is a offline-first, local-only password manager built for Windows and Linux. It is designed to keep your credentials completely under your control with zero cloud synchronization, zero trackers, and zero external network requests. 

Built on top of **Tauri 2**, **Rust**, **React**, and **SQLite**, Veylock provides a native desktop application container with high-performance cryptographic operations and a minimalist macOS-inspired dark user interface.

---

## Core Principles

*   **Local-Only**: Your database lives exclusively on your local device. It is never uploaded to a cloud server or synced outside your machine.
*   **Zero Knowledge**: Your master password is never stored on disk or in memory. You are the only person who can decrypt your vault.
*   **Zero Telemetry**: No tracking, no user profiling, and no telemetry data collection of any kind.
*   **Auditable Cryptography**: Built with heavily-vetted standard cryptographic libraries (`argon2` for key derivation, `aes-gcm` for authenticated encryption, and `zeroize` to clean sensitive memory buffers).

---

## Security Design

Veylock uses a dual-key architecture to secure your credentials:

```
[Master Password] -> Argon2id KDF -> [Key Encryption Key (KEK)]
                                            │
                                            ▼
[Vault Encryption Key (VEK)] <─── Decrypts Wrapped Key
            │
            ▼
   AES-256-GCM Encryption
(Unique 96-bit Nonce per entry)
            │
            ▼
[SQLite Encrypted Payload]
```

*   **Key Derivation**: Uses Argon2id (64MB memory, 3 iterations, 4 parallelism threads) to protect against GPU-based brute-force attacks.
*   **Envelope Encryption**: All sensitive fields (passwords, usernames, URLs, notes, custom fields) are serialized together and encrypted as a single byte array before being written to SQLite.
*   **Memory Protection**: The active Vault Encryption Key (VEK) is wrapped in memory and automatically zeroed out of RAM when the app locks or when the window is closed.
*   **Clipboard Auto-Clear**: Copied secrets are cleared from the system clipboard after 30 seconds. Additionally, locking the vault immediately wipes the clipboard to prevent leakages.

---

## Key Features

1.  **Vault Management**: Secure master password setup, manual locking, and configurable auto-lock timers.
2.  **Flexible Credentials**: Store logins, passwords, URLs, custom tags, and secure notes.
3.  **Password Generator**: Built-in cryptographically secure random password and passphrase generator.
4.  **TOTP Authenticator**: Built-in 2-Factor OTP calculator (RFC 6238 compliant) with active time-remaining counters.
5.  **Vault Auditor**: Local security dashboard highlighting weak passwords, reused credentials, and missing 2FA codes without any external network audits.
6.  **Simple Portability**: Export and import portable, encrypted backups (`.vlock`) or export unencrypted CSV files with built-in plaintext warnings.

---

## Building from Source

### Prerequisites

*   **Node.js**: v20+ and `npm`
*   **Rust**: v1.75+ (`rustc` and `cargo`)
*   **Linux System Packages** (Ubuntu/Debian):
    ```bash
    sudo apt install build-essential pkg-config libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev
    ```

### Step-by-Step Build Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/RoyalRohan/veylock.git
    cd veylock
    ```

2.  **Install Node Dependencies**:
    ```bash
    npm install
    ```

3.  **Run in Development Mode**:
    ```bash
    npm run tauri dev
    ```

4.  **Build the Production Distribution Package**:
    ```bash
    npm run tauri build
    ```
    *   On Linux: Produces a `.deb` package in `src-tauri/target/release/bundle/deb/`
    *   On Windows: Produces a `.exe` installer in `src-tauri/target/release/bundle/msi/` or `nsis/`

---

## Project Guide & Specs

*   [`SECURITY.md`](./SECURITY.md) — Security policy and vulnerability disclosures.
*   [`THREAT_MODEL.md`](./THREAT_MODEL.md) — Threat vectors, mitigations, and architectural boundaries.
*   [`PRIVACY.md`](./PRIVACY.md) — Privacy commitments and local execution specs.

---

## License

Veylock is released under the **MIT License**.
