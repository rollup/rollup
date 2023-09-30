use js_sys::Uint8Array;
use parse_ast::parse_ast;
use wasm_bindgen::prelude::*;
use xxhash;

#[wasm_bindgen]
pub fn parse(code: String, allow_return_outside_function: bool) -> Vec<u8> {
  parse_ast(code, allow_return_outside_function)
}

#[wasm_bindgen]
pub fn xxhash_base64_url(input: Uint8Array) -> String {
  xxhash::xxhash_base64_url(&input.to_vec())
}
