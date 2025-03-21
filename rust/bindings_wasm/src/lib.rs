use js_sys::Uint8Array;
use parse_ast::parse_ast;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn parse(code: String, allow_return_outside_function: bool, jsx: bool) -> Vec<u8> {
  console_error_panic_hook::set_once();
  parse_ast(code, allow_return_outside_function, jsx)
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
