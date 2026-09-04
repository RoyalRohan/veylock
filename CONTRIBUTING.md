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
* **Node.js**: v20+ and `npm`
* **Rust**: `rustc` and `cargo` (1.75+)
* **Linux Dependencies** (if on Linux): `build-essential`, `pkg-config`, `libssl-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`

Commands:
```bash
# Install frontend dependencies
npm install

# Run frontend in browser preview mode
npm run dev

# Run full desktop application in development mode
npm run tauri dev

# Verify TypeScript compilation
npx tsc --noEmit

# Verify production frontend build
npm run build

# Run Rust cryptographic unit tests
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## 3. Pull Request Process

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`).
2. Run TypeScript check (`npx tsc --noEmit`) and Rust unit tests (`cargo test --manifest-path src-tauri/Cargo.toml`).
3. Ensure no new dependencies introduce telemetry, remote network calls, or unvetted cryptographic algorithms.
4. Ensure any new fields added to data models derive `Default` and use `#[serde(default)]` to guarantee 100% backward compatibility.
5. Submit a Pull Request with a clear explanation of changes and rationale.
