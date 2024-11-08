use base_encode::to_string;
use xxhash_rust::xxh3::xxh3_128;

const CHARACTERS_BASE64: &[u8; 64] =
  b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const CHARACTERS_BASE36: &[u8; 36] = b"abcdefghijklmnopqrstuvwxyz0123456789";

const CHARACTERS_BASE16: &[u8; 16] = b"0123456789abcdef";

pub fn xxhash_base64_url(input: &[u8]) -> String {
  to_string(&xxh3_128(input).to_le_bytes(), 64, CHARACTERS_BASE64).unwrap()
}

pub fn xxhash_base36(input: &[u8]) -> String {
  to_string(&xxh3_128(input).to_le_bytes(), 36, CHARACTERS_BASE36).unwrap()
}

pub fn xxhash_base16(input: &[u8]) -> String {
  to_string(&xxh3_128(input).to_le_bytes(), 16, CHARACTERS_BASE16).unwrap()
}
