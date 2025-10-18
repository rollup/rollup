use base_encode::to_string;
use xxhash_rust::xxh3::xxh3_128;

const CHARACTERS_BASE64: &[u8; 64] =
  b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const CHARACTERS_BASE36: &[u8; 36] = b"abcdefghijklmnopqrstuvwxyz0123456789";

pub fn xxhash_base64_url(input: &[u8]) -> String {
  to_string(&xxh3_128(input).to_le_bytes(), 64, CHARACTERS_BASE64).unwrap()
}

pub fn xxhash_base36(input: &[u8]) -> String {
  to_string(&xxh3_128(input).to_le_bytes(), 36, CHARACTERS_BASE36).unwrap()
}

pub fn xxhash_base16(input: &[u8]) -> String {
  // Format each byte as 2 hex digits, preserving leading zeros to always return a 32 digits string.
  xxh3_128(input)
    .to_le_bytes()
    .iter()
    .map(|b| format!("{b:02x}"))
    .collect::<String>()
}
