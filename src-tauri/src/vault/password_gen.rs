use rand::seq::SliceRandom;
use rand::Rng;
use rand::rngs::OsRng;
use super::models::PwGenConfig;

const UPPER: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER: &[u8] = b"abcdefghijkmnopqrstuvwxyz";
const NUMBERS: &[u8] = b"23456789";
const SYMBOLS: &[u8] = b"!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS: &[char] = &['1', 'l', 'I', '0', 'O', '8', 'B', '|', 'S', '5', 'Z', '2'];

const PASSPHRASE_WORDS: &[&str] = &[
    "anchor", "beacon", "cobalt", "dragon", "echo", "falcon", "granite", "horizon",
    "iron", "jaguar", "krypton", "lunar", "matrix", "nebula", "onyx", "phantom",
    "quantum", "radar", "shadow", "titan", "umbrella", "vortex", "whisper", "xenon",
    "yellow", "zephyr", "apex", "blitz", "cipher", "drift", "ember", "forge",
    "glimmer", "haven", "impulse", "jewel", "kinetic", "legacy", "monolith", "nexus",
];

pub fn generate_password_csprng(config: &PwGenConfig) -> Result<String, String> {
    if config.passphrase_mode {
        let count = config.word_count.clamp(3, 10) as usize;
        let sep = if config.separator.is_empty() { "-" } else { &config.separator };
        let mut words = Vec::new();
        for _ in 0..count {
            let idx = OsRng.gen_range(0..PASSPHRASE_WORDS.len());
            words.push(PASSPHRASE_WORDS[idx]);
        }
        return Ok(words.join(sep));
    }

    let mut pool: Vec<u8> = Vec::new();

    if config.use_uppercase {
        pool.extend_from_slice(UPPER);
    }
    if config.use_lowercase {
        pool.extend_from_slice(LOWER);
    }
    if config.use_numbers {
        pool.extend_from_slice(NUMBERS);
    }
    if config.use_symbols {
        pool.extend_from_slice(SYMBOLS);
    }

    if pool.is_empty() {
        pool.extend_from_slice(LOWER);
        pool.extend_from_slice(NUMBERS);
    }

    if config.exclude_ambiguous {
        pool.retain(|&b| !AMBIGUOUS.contains(&(b as char)));
    }

    let len = config.length.clamp(8, 128) as usize;
    let mut password_bytes = Vec::with_capacity(len);

    for _ in 0..len {
        let idx = OsRng.gen_range(0..pool.len());
        password_bytes.push(pool[idx]);
    }

    // Shuffle using OsRng
    password_bytes.shuffle(&mut OsRng);

    String::from_utf8(password_bytes).map_err(|e| format!("Password string encoding failed: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_csprng_password_generation() {
        let config = PwGenConfig {
            length: 20,
            use_uppercase: true,
            use_lowercase: true,
            use_numbers: true,
            use_symbols: true,
            exclude_ambiguous: true,
            passphrase_mode: false,
            word_count: 4,
            separator: "-".to_string(),
        };

        let pw = generate_password_csprng(&config).unwrap();
        assert_eq!(pw.len(), 20);
        assert!(!pw.contains('1'));
        assert!(!pw.contains('l'));
        assert!(!pw.contains('O'));
    }

    #[test]
    fn test_passphrase_generation() {
        let config = PwGenConfig {
            length: 20,
            use_uppercase: false,
            use_lowercase: false,
            use_numbers: false,
            use_symbols: false,
            exclude_ambiguous: false,
            passphrase_mode: true,
            word_count: 4,
            separator: "-".to_string(),
        };

        let pass = generate_password_csprng(&config).unwrap();
        let parts: Vec<&str> = pass.split('-').collect();
        assert_eq!(parts.len(), 4);
    }
}
