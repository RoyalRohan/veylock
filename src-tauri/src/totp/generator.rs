use std::time::{SystemTime, UNIX_EPOCH};
use totp_lite::{totp_custom, Sha1};
use zeroize::Zeroize;

/// Decodes base32 secret string to raw bytes
fn decode_base32(secret: &str) -> Result<Vec<u8>, String> {
    let clean = secret.to_uppercase().replace([' ', '-'], "");
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let mut out = Vec::new();
    let mut buffer: u32 = 0;
    let mut bits_left = 0;

    for c in clean.chars() {
        if c == '=' {
            break;
        }
        let val = alphabet.find(c).ok_or_else(|| format!("Invalid Base32 character: {}", c))? as u32;
        buffer = (buffer << 5) | val;
        bits_left += 5;
        if bits_left >= 8 {
            bits_left -= 8;
            out.push((buffer >> bits_left) as u8);
            buffer &= (1 << bits_left) - 1;
        }
    }
    Ok(out)
}

/// Computes current 6-digit TOTP code and remaining seconds in 30-second window
pub fn generate_totp_code(secret: &str) -> Result<(String, u32), String> {
    let mut raw_bytes = decode_base32(secret)?;
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("System time error: {}", e))?
        .as_secs();

    let step = 30u64;
    let time_remaining = (step - (now % step)) as u32;

    let code = totp_custom::<Sha1>(step, 6, &raw_bytes, now);
    raw_bytes.zeroize();

    Ok((code, time_remaining))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base32_decoding_and_totp() {
        // Standard test secret "JBSWY3DPEHPK3PXP" (Base32 for "Hello!")
        let secret = "JBSWY3DPEHPK3PXP";
        let res = generate_totp_code(secret);
        assert!(res.is_ok());
        let (code, remaining) = res.unwrap();
        assert_eq!(code.len(), 6);
        assert!(remaining <= 30);
    }
}
