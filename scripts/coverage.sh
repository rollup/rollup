#!/usr/bin/env bash
set -euo pipefail

# Runs the given npm test script (default: test:only:coverage) with an
# instrumented native module and writes coverage/rust.lcov for the Rust code.
# Requires cargo-llvm-cov (`cargo install cargo-llvm-cov`) and the
# llvm-tools-preview rustup component. Test failures do not prevent the
# reports but are forwarded through the exit code.

test_script=${1:-test:only:coverage}

rm -rf coverage
mkdir -p coverage/profraw

npm run build:napi:coverage
npm run build:wasm
npm run build:js
npm run build:copy-native

test_exit_code=0
npm run "$test_script" || test_exit_code=$?

LLVM_PROFDATA="$(rustc --print sysroot)/lib/rustlib/$(rustc -vV | sed -n 's/host: //p')/bin/llvm-profdata"
"$LLVM_PROFDATA" merge -sparse coverage/profraw/*.profraw -o coverage/rust.profdata

NODE_FILE="$(ls dist/rollup.*.node)"
LLVM_COV="$(rustc --print sysroot)/lib/rustlib/$(rustc -vV | sed -n 's/host: //p')/bin/llvm-cov"
"$LLVM_COV" export \
  -instr-profile=coverage/rust.profdata \
  -object "$NODE_FILE" \
  -ignore-filename-regex='/.cargo/registry|/rustc/[0-9a-f]+|rust/target' \
  -format=lcov > coverage/rust.lcov

echo "Rust coverage report written to coverage/rust.lcov"
exit "$test_exit_code"
