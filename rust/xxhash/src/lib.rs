use base64::{engine::general_purpose, Engine as _};
use xxhash_rust::xxh3::xxh3_128;

pub fn xxhash_base64_url(input: &[u8]) -> String {
  let hash = xxh3_128(input).to_le_bytes();
  general_purpose::URL_SAFE_NO_PAD.encode(hash)
}
