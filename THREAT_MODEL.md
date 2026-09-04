# Veylock Threat Model

> **Veylock Security Philosophy**: Local-First, Zero-Trust Architecture.

This document outlines the security boundaries, threat actors, attack vectors, and cryptographic mitigations designed into Veylock.

---

## 1. System Overview & Trust Boundaries

```text
┌─────────────────────────────────────────────────────────────┐
│                    TRUSTED BOUNDARY                         │
│                                                             │
│   ┌──────────────────┐               ┌──────────────────┐   │
│   │ Veylock Frontend │  Secure IPC   │  Tauri/Rust Core │   │
│   │   React / TS     │ ────────────► │ Argon2id / AES   │   │
│   └──────────────────┘               └────────┬─────────┘   │
│                                               │             │
└───────────────────────────────────────────────┼─────────────┘
                                                │ Encrypted
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   UNTRUSTED STORAGE / OS                    │
│                                                             │
│         SQLite DB (`vault.sqlite`) / Archives (`.vlock`)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Protected Threats (In-Scope)

### T1: Theft of Local Vault Files (`vault.sqlite` / `.vlock`)
* **Vector**: An attacker steals an unencrypted USB drive, accesses an offline backup, or steals the local SQLite database file.
* **Mitigation**: All credential payloads are encrypted with **AES-256-GCM** using a 256-bit random Vault Encryption Key (VEK). The VEK is wrapped using a Key Encryption Key (KEK) derived via **Argon2id** (64MB memory, 3 iterations, 4 parallelism threads). Without the master password, brute-force is computationally infeasible.

### T2: Database Tampering & Bit-Flipping
* **Vector**: An attacker modifies bytes within `vault.sqlite` to inject corrupted payloads or force cipher errors.
* **Mitigation**: AES-256-GCM is an Authenticated Encryption with Associated Data (AEAD) cipher. Any tampered payload or altered authentication tag fails decryption immediately.

### T3: Master Password Exposure
* **Vector**: Reverse-engineering database tables, log files, configuration files, or memory dumps to discover the master password.
* **Mitigation**: The master password is **NEVER** saved to disk, database, config files, logs, or crash reports. It exists strictly in volatile Rust RAM during key derivation and is discarded.

### T4: Residual Sensitive Data in Memory
* **Vector**: Dump of process memory after locking the vault.
* **Mitigation**: When locked or closed, Veylock zeroizes in-memory decryption keys using Rust's `zeroize` crate and clears all decrypted frontend React state.

### T5: Clipboard Leakage
* **Vector**: Clipboard monitoring malware or user forgetting copied passwords in the OS clipboard.
* **Mitigation**: Copied secrets trigger an automatic background timer (default 30 seconds) that overwrites the OS clipboard with empty text.

---

## 3. Unprotected Threats (Out-of-Scope / Environmental)

### U1: Host System Malware & Keyloggers
* **Vector**: Malware operating with user/root permissions on the host system capturing keystrokes or screen buffers.
* **Mitigation / Technical Reality**: Veylock cannot defend against an OS environment that is already fully compromised by kernel-level keyloggers or screen scrapers.

### U2: Physical Memory Cold Boot Extraction
* **Vector**: Physical RAM freezing and extraction while the vault is active/unlocked.
* **Mitigation / Technical Reality**: Decrypted credentials must exist in memory while the user is actively viewing them. Users should configure Veylock's auto-lock feature (e.g., 5 minutes) to minimize the unlocked window.

### U3: SSD Physical Flash Cell Wear-Leveling
* **Vector**: Microscopic forensic recovery of SSD flash memory blocks after deleting entries.
* **Mitigation / Technical Reality**: Operating systems and SSD controllers manage flash blocks asynchronously. File deletion removes database records, but physical bit sanitization depends on OS TRIM support.

---

## 4. Cryptographic Primitive Summary

| Component | Standard / Primitive | Parameters |
|---|---|---|
| Key Derivation | Argon2id | Memory: 64 MB, Time: 3, Parallelism: 4, Salt: 16-byte random |
| Vault Encryption | AES-256-GCM | 256-bit key, 96-bit random nonce per record, 128-bit tag |
| Randomness | Cryptographically Secure PRNG | `rand::rngs::OsRng` (OS CSPRNG) |
| OTP Generator | HMAC-SHA1 / HMAC-SHA256 TOTP | RFC 6238 compliant, Base32 validation with zeroization, 6/8 digits, 30s/60s period |
| Memory Sanitization | `zeroize` / `zeroize_on_drop` | Applied to master passwords, derived KEK, active VEK, and decoded secret buffers |
