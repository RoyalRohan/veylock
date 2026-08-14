# Contributing to Veylock

Thank you for your interest in contributing to Veylock! We welcome contributions from developers, security researchers, and designers.

---

## 1. Development Guidelines

1. **Security First**: Code changes affecting cryptography, key derivation, or database storage MUST undergo peer review and pass automated security unit tests.
2. **Zero Plaintext Secrets**: Never write or log plaintext passwords, master passwords, key structures, or secrets to stdout, stderr, filesystem, or database columns.
3. **Rust Coding Standards**: Follow `clippy` and `rustfmt` formatting.
4. **TypeScript / React Standards**: Use strict TypeScript definitions, clean hooks, and proper component decomposition.

---

## 2. Setting Up Development Environment

Prerequisites:
* **Node.js**: v18+ and `npm`
* **Rust**: `rustc` and `cargo` (1.75+)
* **Linux Dependencies** (if on Linux): `build-essential`, `libssl-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev` / `libwebkit2gtk-4.0-dev`

Commands:
```bash
# Install dependencies
npm install

# Run application in development mode
npm run tauri dev

# Run Rust unit tests
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## 3. Pull Request Process

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`).
2. Run unit tests and static security linters.
3. Ensure no new dependencies introduce unnecessary telemetry or unvetted cryptographic algorithms.
4. Submit a Pull Request with a clear explanation of changes and rationale.
