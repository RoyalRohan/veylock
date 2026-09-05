# Veylock Security Policy

Veylock is a security-sensitive application. If you discover a vulnerability, please report it privately so it can be investigated before public disclosure.

## Reporting a vulnerability

Do not publish an unverified security vulnerability in a public GitHub issue.

Send a private report to:

**royalfga69@gmail.com**

Please include, when available:

1. A clear description of the issue and its impact.
2. Reproduction steps or a proof of concept.
3. The Veylock version and affected platform.
4. Relevant logs or configuration details with all user secrets removed.
5. Whether the issue affects the vault, backup format, authentication, IPC, or another boundary.

Never attach a real vault database, real `.vlock` backup, private key, password, or other sensitive user data to a report.

## Security design

Veylock's documented design uses a Rust/Tauri security boundary, Argon2id key derivation, AES-256-GCM authenticated encryption, local SQLite persistence, TOTP validation/generation, and memory zeroization for sensitive key material. fileciteturn0file0L23-L37 fileciteturn0file0L43-L69

The threat model and architecture documents describe the project's current assumptions and boundaries in more detail.

## What the application is designed to protect

The current implementation is designed to protect against, among other things:

- theft of the local encrypted vault database or an encrypted `.vlock` backup without the master password;
- tampering with encrypted payloads, where authenticated decryption should fail;
- storing the master password directly on disk;
- residual key material after the vault is locked, to the extent the application's zeroization strategy can provide it;
- accidental long-term clipboard exposure through timed clearing. fileciteturn0file5L23-L33

## What Veylock cannot guarantee

Veylock cannot protect a user from a fully compromised operating system, kernel-level malware, active keyloggers, screen capture, or physical attacks against an unlocked device. The project threat model explicitly treats these as environmental limits. fileciteturn0file6L56-L68

No password manager should be presented as invulnerable. Security claims should be evaluated against the actual release, source code, platform, and threat model.

## Security-focused development

Security-sensitive changes should be reviewed carefully and tested. Do not introduce plaintext secret logging, unnecessary network communication, unsafe serialization, or unreviewed cryptographic dependencies. Contribution guidance is documented in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Disclosure

When a confirmed vulnerability is resolved, the project may publish a release note describing the impact and the fix without exposing sensitive reproduction material.
