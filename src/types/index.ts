export type CategoryType =
  | 'all'
  | 'favorites'
  | 'logins'
  | 'secure_notes'
  | 'totp'
  | 'cards'
  | 'licenses'
  | 'servers'
  | 'api_credentials'
  | 'health';

export interface CustomField {
  id: string;
  name: string;
  value: string;
  fieldType: 'text' | 'sensitive';
  field_type?: 'text' | 'sensitive';
}

export interface EntryBase {
  id: string;
  title: string;
  notes: string;
  category: string;
  favorite: boolean;
  tags: string[];
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export interface LoginEntry extends EntryBase {
  category: 'logins';
  username: string;
  email: string;
  password: string;
  url: string;
  totp_secret?: string;
  totp_issuer?: string;
}

export interface SecureNoteEntry extends EntryBase {
  category: 'secure_notes';
}

export interface AuthenticatorEntry extends EntryBase {
  category: 'totp';
  username: string; // account identifier
  totp_secret: string;
  totp_issuer: string;
  totp_algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  totp_digits?: number; // 6 | 8
  totp_period?: number; // 30 | 60
}

export interface CardEntry extends EntryBase {
  category: 'cards';
  cardholder_name?: string;
  card_number?: string;
  card_exp_month?: string;
  card_exp_year?: string;
  card_cvv?: string;
  card_pin?: string;
  card_type?: string;
  card_billing_address?: string;
}

export interface LicenseEntry extends EntryBase {
  category: 'licenses';
  license_key?: string;
  license_vendor?: string;
  license_version?: string;
  license_purchase_date?: string;
  license_expires_at?: string;
  url?: string;
}

export interface ServerEntry extends EntryBase {
  category: 'servers';
  server_host?: string;
  server_port?: string;
  server_protocol?: string;
  username?: string;
  password?: string;
  server_key?: string;
  server_environment?: string;
}

export interface ApiCredentialEntry extends EntryBase {
  category: 'api_credentials';
  url?: string;
  api_key?: string;
  api_secret?: string;
  api_client_id?: string;
  api_client_secret?: string;
  api_environment?: string;
}

export type VaultEntry =
  | LoginEntry
  | SecureNoteEntry
  | AuthenticatorEntry
  | CardEntry
  | LicenseEntry
  | ServerEntry
  | ApiCredentialEntry;

export interface DecryptedEntry {
  id: string;
  title: string;
  username: string;
  email: string;
  password: string;
  url: string;
  notes: string;
  category: string;
  favorite: boolean;
  tags: string[];
  custom_fields: CustomField[];
  totp_secret?: string;
  totp_issuer?: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;

  // Authenticator extensions
  totp_algorithm?: string;
  totp_digits?: number;
  totp_period?: number;

  // Card extensions
  cardholder_name?: string;
  card_number?: string;
  card_exp_month?: string;
  card_exp_year?: string;
  card_cvv?: string;
  card_pin?: string;
  card_type?: string;
  card_billing_address?: string;

  // License extensions
  license_key?: string;
  license_vendor?: string;
  license_version?: string;
  license_purchase_date?: string;
  license_expires_at?: string;

  // Server extensions
  server_host?: string;
  server_port?: string;
  server_protocol?: string;
  server_key?: string;
  server_environment?: string;

  // API Credential extensions
  api_key?: string;
  api_secret?: string;
  api_client_id?: string;
  api_client_secret?: string;
  api_environment?: string;
}

export interface VaultStatus {
  exists: boolean;
  unlocked: boolean;
  auto_lock_minutes: number;
  entry_count: number;
}

export interface PwGenConfig {
  length: number;
  use_uppercase: boolean;
  use_lowercase: boolean;
  use_numbers: boolean;
  use_symbols: boolean;
  exclude_ambiguous: boolean;
  passphrase_mode: boolean;
  word_count: number;
  separator: string;
}

export interface TotpResult {
  code: string;
  time_remaining: number;
}

export interface VaultHealthReport {
  total_entries: number;
  weak_passwords: number;
  reused_passwords: number;
  missing_totp: number;
  total_score: number;
}
