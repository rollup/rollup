use napi::{bindgen_prelude::*, ScopedTask};
use napi_derive::napi;
use parse_ast::parse_ast;
use std::mem;

#[cfg(all(
  not(all(target_os = "linux", target_arch = "loongarch64")),
  not(all(target_os = "linux", target_arch = "riscv64", target_env = "musl")),
  not(all(target_os = "linux", target_env = "ohos")),
  not(all(target_os = "freebsd", target_arch = "aarch64")),
  not(debug_assertions)
))]
#[global_allocator]
static ALLOC: mimalloc_safe::MiMalloc = mimalloc_safe::MiMalloc;

pub struct ParseTask {
  pub code: String,
  pub allow_return_outside_function: bool,
  pub jsx: bool,
}

#[napi]
impl<'task> ScopedTask<'task> for ParseTask {
  type Output = Vec<u8>;
  type JsValue = BufferSlice<'task>;

  fn compute(&mut self) -> Result<Self::Output> {
    Ok(parse_ast(
      mem::take(&mut self.code),
      self.allow_return_outside_function,
      self.jsx,
      None,
    ))
  }

  fn resolve(&mut self, env: &'task Env, output: Self::Output) -> Result<Self::JsValue> {
    BufferSlice::from_data(env, output)
  }
}

pub struct ParseAndWalkTask {
  pub code: String,
  pub allow_return_outside_function: bool,
  pub jsx: bool,
  pub walked_nodes_bitset: BigUint64Array,
}

#[napi]
impl<'task> ScopedTask<'task> for ParseAndWalkTask {
  type Output = Vec<u8>;
  type JsValue = BufferSlice<'task>;

  fn compute(&mut self) -> Result<Self::Output> {
    Ok(parse_ast(
      mem::take(&mut self.code),
      self.allow_return_outside_function,
      self.jsx,
      Some(self.walked_nodes_bitset.as_ref()),
    ))
  }

  fn resolve(&mut self, env: &'task Env, output: Self::Output) -> Result<Self::JsValue> {
    BufferSlice::from_data(env, output)
  }
}

#[napi]
pub fn parse<'env>(
  env: &'env Env,
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
) -> Result<BufferSlice<'env>> {
  BufferSlice::from_data(
    env,
    parse_ast(code, allow_return_outside_function, jsx, None),
  )
}

#[napi]
pub fn parse_async(
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
  signal: Option<AbortSignal>,
) -> AsyncTask<ParseTask> {
  AsyncTask::with_optional_signal(
    ParseTask {
      code,
      allow_return_outside_function,
      jsx,
    },
    signal,
  )
}

#[napi]
pub fn parse_and_walk(
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
  walked_nodes_bitset: BigUint64Array,
  signal: Option<AbortSignal>,
) -> AsyncTask<ParseAndWalkTask> {
  AsyncTask::with_optional_signal(
    ParseAndWalkTask {
      code,
      allow_return_outside_function,
      jsx,
      walked_nodes_bitset,
    },
    signal,
  )
}

#[napi]
pub fn xxhash_base64_url(input: &[u8]) -> String {
  xxhash::xxhash_base64_url(input)
}

#[napi]
pub fn xxhash_base36(input: &[u8]) -> String {
  xxhash::xxhash_base36(input)
}

#[napi]
pub fn xxhash_base16(input: &[u8]) -> String {
  xxhash::xxhash_base16(input)
}
