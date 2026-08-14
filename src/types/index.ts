export type CategoryType = 'all' | 'favorites' | 'logins' | 'secure_notes' | 'cards' | 'servers' | 'totp' | 'health';

export interface CustomField {
  id: string;
  name: string;
  value: string;
  fieldType: 'text' | 'sensitive';
}

export interface DecryptedEntry {
  id: string;
  title: string;
  username: string;
  email: string;
  password: string;
  url: string;
  notes: string;
  category: string; // 'logins' | 'secure_notes' | 'cards' | 'servers'
  favorite: boolean;
  tags: string[];
  custom_fields: CustomField[];
  totp_secret?: string;
  totp_issuer?: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
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
