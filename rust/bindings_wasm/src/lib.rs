use parse_ast::parse_ast;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn parse(code: String) -> Vec<u8> {
  parse_ast(code)
}
