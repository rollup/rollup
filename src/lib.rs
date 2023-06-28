#![deny(clippy::all)]
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn sum(a: i32, b: i32) -> i32 {
  a + b
}

#[napi]
pub fn create_buffer() -> Buffer {
  vec![0, 1, 2].into()
}

