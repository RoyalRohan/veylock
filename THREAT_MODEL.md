# Veylock Threat Model

> **Security philosophy:** local-first, zero-trust boundaries, explicit user control.

This document describes the threats the application is designed to address and the environmental threats it cannot reasonably eliminate.

## 1. Trust boundaries

```text
┌──────────────────────────────────────────────────────────────┐
│                         TRUSTED CORE                         │
│  React / TypeScript  ── Tauri IPC ──  Rust security core   │
│                                      │                       │
│                         Crypto / Vault / SQLite              │
└──────────────────────────────────────┼───────────────────────┘
                                       │ encrypted data
┌──────────────────────────────────────▼───────────────────────┐
│                    LOCAL FILE SYSTEM / OS                    │
│            vault.sqlite · encrypted .vlock files            │
└──────────────────────────────────────────────────────────────┘
```

The documented architecture places React/TypeScript on one side of the IPC boundary and the Rust security/storage core on the other. fileciteturn0file6L11-L26

## 2. In-scope threats

### T1 — Theft of an encrypted vault file

**Threat:** An attacker obtains `vault.sqlite` or a `.vlock` backup.

**Mitigation:** Sensitive entry payloads are protected with AES-256-GCM, while the vault encryption key is wrapped by a key derived through Argon2id. fileciteturn0file6L32-L36

### T2 — Database tampering

**Threat:** An attacker modifies encrypted database content.

**Mitigation:** AES-GCM authentication should cause modified ciphertext or tags to fail verification rather than silently producing trusted plaintext. fileciteturn0file6L38-L40

### T3 — Master-password disclosure through storage

**Threat:** The master password is recovered from files, configuration, or logs.

**Mitigation:** The documented design does not persist the master password to the vault database or configuration files. fileciteturn0file6L42-L44

### T4 — Residual key material in memory

**Threat:** Sensitive key material remains available after locking.

**Mitigation:** Rust key buffers use zeroization, and the renderer clears decrypted state when the vault is locked. fileciteturn0file6L46-L48

### T5 — Clipboard leakage

**Threat:** A copied secret remains in the OS clipboard longer than necessary.

**Mitigation:** Veylock uses a timed clipboard-clearing mechanism, documented as 30 seconds by default in the current implementation. fileciteturn0file6L50-L52

## 3. Out-of-scope environmental threats

### U1 — Compromised operating system

A keylogger, screen scraper, malicious browser, kernel-level malware, or process running with sufficient privileges can observe secrets while the vault is unlocked. Veylock does not claim to defeat a fully compromised host. fileciteturn0file6L56-L60

### U2 — Cold-boot or direct RAM extraction

Decrypted credentials necessarily exist in memory while users are viewing them. A short auto-lock period reduces exposure but cannot eliminate physical-memory attacks. fileciteturn0file6L62-L64

### U3 — Physical storage remanence

Deleting a database record does not guarantee physical sanitization of every underlying flash cell. Storage controllers and the operating system determine how blocks are reclaimed. fileciteturn0file6L66-L68

## 4. Cryptographic summary

| Function | Primitive | Current documented parameters |
|---|---|---|
| Key derivation | Argon2id | 64 MB memory, time 3, parallelism 4, 16-byte salt |
| Vault encryption | AES-256-GCM | 256-bit key, 96-bit random nonce, 128-bit tag |
| Randomness | OS CSPRNG | `rand::rngs::OsRng` |
| TOTP | HMAC-SHA1 / HMAC-SHA256 | RFC 6238, Base32 validation, 6/8 digits, 30/60s period |
| Memory sanitization | `zeroize` | Password/key/decoded-secret buffers where implemented |
