// The #[napi] macro generates #[no_mangle] extern "C" thunks whose coverage
// is not tracked by rustc when the cdylib is loaded via dlopen (as Node loads
// .node addons). Disabling coverage on the #[napi] items avoids misleading
// "uncovered" noise for lines that are definitely called. The feature gate
// ensures this only affects coverage builds.
#![cfg_attr(coverage, feature(coverage_attribute))]

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

#[cfg_attr(coverage, coverage(off))]
#[napi]
impl<'task> ScopedTask<'task> for ParseTask {
  type Output = Vec<u8>;
  type JsValue = BufferSlice<'task>;

  fn compute(&mut self) -> Result<Self::Output> {
    Ok(parse_ast(
      mem::take(&mut self.code),
      self.allow_return_outside_function,
      self.jsx,
    ))
  }

  fn resolve(&mut self, env: &'task Env, output: Self::Output) -> Result<Self::JsValue> {
    BufferSlice::from_data(env, output)
  }
}

#[cfg_attr(coverage, coverage(off))]
#[napi]
pub fn parse<'env>(
  env: &'env Env,
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
) -> Result<BufferSlice<'env>> {
  BufferSlice::from_data(env, parse_ast(code, allow_return_outside_function, jsx))
}

#[cfg_attr(coverage, coverage(off))]
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

#[cfg_attr(coverage, coverage(off))]
#[napi]
pub fn xxhash_base64_url(input: &[u8]) -> String {
  xxhash::xxhash_base64_url(input)
}

#[cfg_attr(coverage, coverage(off))]
#[napi]
pub fn xxhash_base36(input: &[u8]) -> String {
  xxhash::xxhash_base36(input)
}

#[cfg_attr(coverage, coverage(off))]
#[napi]
pub fn xxhash_base16(input: &[u8]) -> String {
  xxhash::xxhash_base16(input)
}

/// Manually writes the LLVM coverage profile data to disk.
///
/// On Linux, the LLVM profiler runtime's `atexit` handler does not fire for
/// shared libraries loaded via `dlopen` (as Node loads `.node` addons), so
/// coverage data is never flushed. This function calls
/// `__llvm_profile_initialize_file()` (to parse `LLVM_PROFILE_FILE`) and
/// `__llvm_profile_write_file()` directly so the test runner can invoke it
/// from a `process.on('exit')` handler.
///
/// Only compiled when `cfg(coverage)` is active (set by `cargo-llvm-cov
/// show-env`), so it has zero impact on production builds.
#[cfg(coverage)]
#[cfg_attr(coverage, coverage(off))]
#[napi]
pub fn flush_llvm_coverage() {
  extern "C" {
    fn __llvm_profile_initialize_file();
    fn __llvm_profile_write_file() -> std::os::raw::c_int;
  }
  unsafe {
    __llvm_profile_initialize_file();
    __llvm_profile_write_file();
  }
}
