# Security Policy for Veylock

Veylock takes security extremely seriously. As a local-first, privacy-focused password manager, our primary objective is to protect user credentials on their own devices.

## Reporting a Vulnerability

If you discover a potential security vulnerability in Veylock, please report it responsibly.

**Please DO NOT open a public issue on GitHub for unconfirmed security vulnerabilities.**

Instead, please send an encrypted or private security report to:
* **Email**: `royalfga69@gmail.com`

### What to Include in Your Report

To help us triage and resolve the issue quickly, please include:
1. A clear description of the vulnerability and its potential impact.
2. Step-by-step instructions or proof-of-concept (PoC) code to reproduce the issue.
3. The platform (Windows / Linux), Veylock version, and Tauri runtime details.
4. Any relevant logs or system configurations (ensuring no plaintext sensitive user secrets are attached).


## Security Guarantees & Non-Guarantees

### What Veylock Protects
* **Data at Rest**: Vault data is encrypted using AES-256-GCM authenticated encryption.
* **Key Isolation**: Vault Encryption Keys (VEK) are derived using Argon2id and wrapped in RAM. Master passwords are never stored anywhere on disk or DB.
* **Data Integrity**: Nonce collision prevention and AEAD authentication tags ensure tampered database records cannot be decrypted.
* **Clipboard Leakage**: Secrets copied to clipboard are auto-cleared after a configurable timeout (default 30s).

### What Veylock Cannot Protect Against
* **Compromised Host OS**: Active keyloggers, screen scrapers, or memory hooks running at host level.
* **Cold Boot Attacks**: Direct physical RAM extraction while the application vault is currently unlocked.
* **Hardware Physical Access**: Physical tampering of an unlocked active computer session without auto-lock.

Thank you for helping keep Veylock secure!
