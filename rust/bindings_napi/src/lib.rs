use napi::bindgen_prelude::*;
use napi_derive::napi;
use parse_ast::parse_ast;

#[cfg(all(
  not(all(target_os = "linux", target_env = "musl", target_arch = "aarch64")),
  not(debug_assertions)
))]
#[global_allocator]
static ALLOC: mimalloc_rust::GlobalMiMalloc = mimalloc_rust::GlobalMiMalloc;

#[napi]
pub fn parse(code: String, allow_return_outside_function: bool) -> Buffer {
  parse_ast(code, allow_return_outside_function).into()
}

#[napi]
pub fn xxhash_base64_url(input: Uint8Array) -> String {
  xxhash::xxhash_base64_url(&input)
}
