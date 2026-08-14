use std::collections::HashMap;
use super::models::{DecryptedEntry, VaultHealthReport};

pub fn evaluate_vault_health(entries: &[DecryptedEntry]) -> VaultHealthReport {
    let total_entries = entries.len();
    if total_entries == 0 {
        return VaultHealthReport {
            total_entries: 0,
            weak_passwords: 0,
            reused_passwords: 0,
            missing_totp: 0,
            total_score: 100,
        };
    }

    let mut weak_count = 0;
    let mut missing_totp_count = 0;
    let mut password_counts: HashMap<String, usize> = HashMap::new();

    for entry in entries {
        // Password weakness check
        let pwd = &entry.password;
        if is_weak_password(pwd) {
            weak_count += 1;
        }

        // Count password occurrences for reuse detection
        if !pwd.trim().is_empty() {
            *password_counts.entry(pwd.clone()).or_insert(0) += 1;
        }

        // Missing TOTP check for login items
        if (entry.category == "logins" || entry.category.is_empty())
            && entry.totp_secret.as_deref().unwrap_or("").trim().is_empty()
        {
            missing_totp_count += 1;
        }
    }

    let reused_count = password_counts.values().filter(|&&c| c > 1).count();

    // Calculate score
    let mut score: i32 = 100;
    score -= (weak_count * 15) as i32;
    score -= (reused_count * 20) as i32;
    score -= (missing_totp_count * 3) as i32;

    let final_score = score.clamp(0, 100) as u32;

    VaultHealthReport {
        total_entries,
        weak_passwords: weak_count,
        reused_passwords: reused_count,
        missing_totp: missing_totp_count,
        total_score: final_score,
    }
}

pub fn is_weak_password(password: &str) -> bool {
    if password.len() < 10 {
        return true;
    }
    let has_upper = password.chars().any(|c| c.is_ascii_uppercase());
    let has_lower = password.chars().any(|c| c.is_ascii_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());
    let has_symbol = password.chars().any(|c| !c.is_alphanumeric());

    !(has_upper && has_lower && has_digit && has_symbol)
}
