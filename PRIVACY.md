# Veylock Privacy

Veylock is designed around local control: your vault should remain on your device unless you deliberately export it.

## No account required

Veylock does not require a Veylock account, subscription, phone number, or registration for normal vault use.

## Local storage

Vault data is stored locally on the device. Sensitive entry payloads are stored in the local SQLite vault or in encrypted `.vlock` backup files selected by the user. The project does not depend on a central Veylock server for normal vault operations. fileciteturn0file3L22-L41

The current architecture identifies `vault.sqlite` as local device storage and `.vlock` as the portable encrypted backup format. fileciteturn0file0L33-L37

## Telemetry and analytics

The project is designed without usage analytics or background telemetry. The current project documentation lists no tracking scripts, analytics SDKs, crash-report uploads, usage telemetry, or background pinging. fileciteturn0file3L9-L18

## Network behavior

Veylock does not require an internet connection to create, unlock, read, update, or manage a vault. External-link actions, such as opening a stored website, use the device's standard browser handling. fileciteturn0file3L30-L35

Release downloads, GitHub pages, and links deliberately opened by the user are outside the vault's local storage model.

## Backups

Backups are encrypted `.vlock` files intended to be controlled by the user. Keep backup files in a location that survives application removal and device changes; do not treat an application's private data directory as the only backup location.

The project documents a backup/export pipeline and an encrypted `.vlock` archive format. fileciteturn0file0L208-L234

## Privacy boundaries

Local-first does not mean the host operating system is trusted absolutely. Malware, keyloggers, compromised operating-system components, or physical attacks against an unlocked device can still expose data. See [THREAT_MODEL.md](./THREAT_MODEL.md).

## Verification

Source availability allows independent review of the implementation and the claims made in this document. Security-sensitive claims should be understood together with the implementation, release build, and threat model rather than treated as a guarantee against every possible attack.
