extern crate napi_build;

fn main() {
  // cargo-llvm-cov sets cfg(coverage) via `cargo llvm-cov show-env`.
  println!("cargo::rustc-check-cfg=cfg(coverage)");
  println!("cargo::rustc-check-cfg=cfg(coverage_nightly)");
  napi_build::setup();
}
