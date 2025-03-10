use napi::bindgen_prelude::*;
use napi_derive::napi;
use parse_ast::parse_ast;

#[cfg(all(
  not(all(target_os = "linux", target_env = "musl", target_arch = "aarch64")),
  not(all(target_os = "linux", target_arch = "loongarch64")),
  not(all(target_os = "freebsd", target_arch = "aarch64")),
  not(debug_assertions)
))]
#[global_allocator]
static ALLOC: mimalloc_rust::GlobalMiMalloc = mimalloc_rust::GlobalMiMalloc;

pub struct ParseTask {
  pub code: String,
  pub allow_return_outside_function: bool,
  pub jsx: bool,
}

#[napi]
impl Task for ParseTask {
  type Output = Buffer;
  type JsValue = Buffer;

  fn compute(&mut self) -> Result<Self::Output> {
    Ok(
      parse_ast(
        self.code.clone(),
        self.allow_return_outside_function,
        self.jsx,
      )
      .into(),
    )
  }

  fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
    Ok(output)
  }
}

#[napi]
pub fn parse(code: String, allow_return_outside_function: bool, jsx: bool) -> Buffer {
  parse_ast(code, allow_return_outside_function, jsx).into()
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
pub fn xxhash_base64_url(input: Uint8Array) -> String {
  xxhash::xxhash_base64_url(&input)
}

#[napi]
pub fn xxhash_base36(input: Uint8Array) -> String {
  xxhash::xxhash_base36(&input)
}

#[napi]
pub fn xxhash_base16(input: Uint8Array) -> String {
  xxhash::xxhash_base16(&input)
}
