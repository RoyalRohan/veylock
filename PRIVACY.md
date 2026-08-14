# Veylock Privacy Policy

> **Core Commitment**: Your secrets stay on your device. Period.

Veylock was designed from the ground up to respect user sovereignty and privacy.

---

## 1. Zero Telemetry & Zero Analytics

Veylock contains:
* **NO** tracking scripts
* **NO** analytics SDKs (Google Analytics, Mixpanel, Sentry, etc.)
* **NO** crash report uploads
* **NO** usage telemetry
* **NO** background pinging

The application does not phone home to any central Veylock server. In fact, **there is no central Veylock server**.

---

## 2. Local-Only Storage

* Your master password, usernames, passwords, TOTP keys, and secure notes are stored **strictly on your local device**.
* Vault data is saved to a local SQLite database (`vault.sqlite`) or portable encrypted files (`.vlock`) chosen explicitly by you.
* Veylock never uploads, syncs, or transmits your credentials anywhere automatically.

---

## 3. Network Usage & Third-Party Services

Veylock operates **100% offline**.

* It does not require an Internet connection to create, read, update, unlock, or manage your vault.
* External link actions (e.g., clicking "Open Website") open URLs in your default operating system web browser via standard OS handlers.

---

## 4. Account Requirements

* Veylock does **NOT** require an account, email address, phone number, subscription, or registration.
* You control your vault files and backups directly.

---

## 5. Security & Verification

Because Veylock is open source, anyone can audit the codebase, inspect network activity, build the application independently from source code, and verify these privacy assertions.
