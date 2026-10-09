# rust/ - Rust and JS-Rust Boundary Rules

## Workspace Layout

- Real logic lives in `parse_ast` (AST conversion) and `xxhash`; `bindings_napi` and `bindings_wasm` are thin shims — new parsing/conversion code goes into `parse_ast`, never into a binding
- `build:wasm` targets the web (output `wasm/`, used by the browser) and `build:wasm:node` targets nodejs (output `wasm-node/`); both build the same `bindings_wasm` crate, so changes affect browser and Node-WASM alike
- The toolchain is pinned in `rust-toolchain.toml`; use the npm build scripts, not bare cargo. `lint:rust` (cargo fmt + clippy) is not run by the pre-commit hook — run it manually

## Codegen Contract

- `scripts/ast-types.js` is the single source of truth for the buffer layout. `npm run build:ast-converters` regenerates the Rust constant/macro files AND the JS parsers; the only schema outside `ast-types.js` is the fixed string table in `scripts/generate-string-constants.js`, which the same command regenerates
- Node-type codes are positional: inserting or reordering a node in `AST_NODES` renumbers all later type codes on both the Rust and JS side
- In `ast-types.js`, `hasSameFieldsAs`, `useMacro: false` and `fixed` are codegen directives, not dead config: they control whether a node reuses another node's field constants, is implemented as a manual `store_*` function in `ast_nodes/` instead of a generated macro, or has a constant field. Check these before assuming all nodes are macro-generated
- The SWC parser runs with a fixed `EsSyntax` feature set in `parse_ast/src/lib.rs` — supporting a new JS syntax feature means enabling it there and handling the new AST variants in the converter, not per-binding

## Buffer Format

- Integer fields are native-endian on both sides (written with `to_ne_bytes()`, read via `Uint32Array`); f64 literal values are explicitly little-endian (`to_le_bytes()` on the Rust side, `DataView.getFloat64(..., true)` on the JS side). The buffer is 4-byte aligned throughout; strings are padded to multiples of 4 — new fields must preserve alignment
- Build one `Vec<u8>` strictly forward; reserve header/child slots up front (`add_type_and_start` + `resize`) and patch references via `update_reference_position` (references are 32-bit word indices into the buffer, 0 means absent) — never re-index or walk the buffer to fix offsets; `shrink_to_fit` only at the end
- `parse_ast` never returns `Result`: parse errors are always encoded as a `ParseError` AST node that JS detects and converts to a thrown error; on NAPI, panics are caught and encoded as `PanicError` the same way, but the WASM build uses `panic_immediate_abort` and simply aborts — keep these protocols
- Positions must be emitted in ascending order (the UTF-8→UTF-16 converter panics on backwards positions); stored `start`/`end` are UTF-16 offsets, never raw SWC UTF-8 spans

## Bindings Sync

- A new binding function must be added to both `rust/bindings_napi/src/lib.rs` AND `rust/bindings_wasm/src/lib.rs` plus all three JS handover points with matching names: `native.js`, `native.wasm.js`, `browser/src/wasm.ts` (`lint:native-js` only checks that every export in `native.js` is also present in `native.wasm.js` — signatures and reverse parity are not checked)
- napi-rs auto-camelCases Rust names; wasm-bindgen needs an explicit `#[wasm_bindgen(js_name = ...)]` where the camelCase mapping is not automatic
- Build-flag-gated bindings (NAPI only, e.g. `flush_llvm_coverage`) need a conditional export in `native.js` AND a no-op in `native.wasm.js` to keep the export-parity lint green
- `native.d.ts` and `wasm/*.d.ts` are auto-generated — never hand-edit them
