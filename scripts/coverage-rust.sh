#!/usr/bin/env bash
set -euo pipefail

# Builds the instrumented NAPI module, runs JS tests, and produces Rust LCOV coverage.
# Requires cargo-llvm-cov (`cargo install cargo-llvm-cov`) and the llvm-tools-preview rustup component.

LLVM_PROFILE_FILE="$PWD/coverage/profraw/rollup-%p-%12m.profraw"
export LLVM_PROFILE_FILE

rm -rf coverage/profraw
mkdir -p coverage/profraw

npm run build:napi:coverage
npm run build:cjs
# On Linux, the LLVM profiler runtime's atexit handler does not fire for
# dlopen'd shared libraries, so scripts/coverage-flush.js manually calls
# flushLlvmCoverage() on process exit.
NODE_OPTIONS="--require $PWD/scripts/coverage-flush.js" nyc --reporter lcovonly mocha test/test.js

LLVM_PROFDATA="$(rustc --print sysroot)/lib/rustlib/$(rustc -vV | sed -n 's/host: //p')/bin/llvm-profdata"
"$LLVM_PROFDATA" merge -sparse coverage/profraw/*.profraw -o coverage/rust.profdata

LLVM_COV="$(rustc --print sysroot)/lib/rustlib/$(rustc -vV | sed -n 's/host: //p')/bin/llvm-cov"
NODE_FILE="$(ls dist/rollup.*.node)"
"$LLVM_COV" export \
  -instr-profile=coverage/rust.profdata \
  -object "$NODE_FILE" \
  -ignore-filename-regex='/.cargo/registry|/rustc/[0-9a-f]+|rust/target' \
  -format=lcov > coverage/rust.lcov

echo "Rust coverage report written to coverage/rust.lcov"
