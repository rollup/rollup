#![deny(clippy::all)]

use napi::bindgen_prelude::*;
use napi_derive::napi;
use parse_ast::parse_ast;

#[napi]
pub fn parse(code: String) -> Buffer {
  parse_ast(code).into()
}
