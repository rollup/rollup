use js_sys::Uint8Array;
use parse_ast::parse_ast;
use wasm_bindgen::prelude::*;

// WebAssembly is always little-endian while the JS side reads the buffer in the byte order of the
// host, so on big-endian hosts the JS side asks for the 32-bit fields to be byte-swapped.
#[wasm_bindgen]
pub fn parse(
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
  swap_byte_order: bool,
) -> Vec<u8> {
  console_error_panic_hook::set_once();
  parse_ast(code, allow_return_outside_function, jsx, swap_byte_order)
}

#[wasm_bindgen(js_name=xxhashBase64Url)]
pub fn xxhash_base64_url(input: Uint8Array) -> String {
  console_error_panic_hook::set_once();
  xxhash::xxhash_base64_url(&input.to_vec())
}

#[wasm_bindgen(js_name=xxhashBase36)]
pub fn xxhash_base36(input: Uint8Array) -> String {
  console_error_panic_hook::set_once();
  xxhash::xxhash_base36(&input.to_vec())
}

#[wasm_bindgen(js_name=xxhashBase16)]
pub fn xxhash_base16(input: Uint8Array) -> String {
  console_error_panic_hook::set_once();
  xxhash::xxhash_base16(&input.to_vec())
}
