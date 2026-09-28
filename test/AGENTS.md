# test/ - Testing Rules

## Category Selection

- Preferred for new tests: **function** — bundles `main.js`, executes the output, and has `node:assert` injected as a global in the bundled code. Use it when asserting that code actually runs, for build errors, warnings, and plugin hooks (inline asserts in `main.js` or asserts inside the `exports` config field)
- **form**: output shape/tree-shaking, never executes the output, use it when verifying dead code is actually removed
- **chunking-form**: multiple output files/assets (whole output directories are compared), similar to form. Note that `function` tests also support multiple output chunks as long as the entry point is `main.js`.
- **cli**: running rollup as a command line tool
- **incremental**: behavior across multiple runs with cache; **sourcemaps**: map assertions
- Do not add new tests to `test/hooks` (legacy plugin-interface suite) — use `function` tests instead
- `test/misc` and `test/incremental` are hand-written mocha files: add the file AND require it from the category `index.js`
- `test/watch` tests are code in `watch/index.js`; its `samples/` only holds input files — no `_config.js` per watch test
- All runners test the built `dist/` artifact, never `src/`

## Running Tests

- Fast loop: add `solo: true` to the `_config.js`, run `npm run build:quick` then `npm run test:quick` (bails on first failure). Remove `solo` before committing — it disables the entire suite and fails the CI run, where mocha forbids `.only`
- `test:quick` does not run browser tests, and some CLI tests require the ES build and fail without it — use the full build and `npm run test:all` before declaring those green
- On Windows, `core.symlinks true` is required or symlink-based tests fail
- `npm run test:update-snapshots` walks ALL form and chunking-form samples and copies `_actual`/`_actual.js` over `_expected`, throwing when any sample lacks output — a full (non-bailed) prior run must have produced fresh `_actual` output everywhere

## Directory-Based Test Contracts

- `_actual*` output is deleted before each run; after a failed form/chunking-form/cli run it remains for inspection
- Tests `process.chdir` into the sample directory — use absolute paths (`path.resolve(__dirname, ...)`) in configs
- Directories without `_config.js` group their subdirectories as a nested `describe`
- Platform gates: `skip`, `minNodeVersion`, `onlyWindows`, `skipIfWindows`; all options per category are defined in `test/types.d.ts`

## function

- Execution starts from `main.js` in the output; with exactly one output chunk, that chunk is executed regardless of name, so a different `options.input` works too — with multiple outputs, `main.js` must be among them
- In `_config.js`, use `const assert = require('node:assert/strict')` for asserts in config functions; the injected `assert` global only exists inside the bundled code
- In the normal path (no expected build error, no custom `options.onLog`): `logs` and `warnings` are mutually exclusive, and if neither is set, any unexpected warning fails the test
- `error`/`warnings` comparisons are deep-equal on normalized logs: `stack`/`toString` are stripped, `frame` is de-indented — supply the exact fields (`code`, `message`, `id`, `pos`, `loc`, `frame`)

## form

- An `_expected.js` file present = single-format comparison (default es, overridable via `options.output.format`) plus a second run from cache; preferred over an `_expected/` directory (all formats, each a separate `it`, plus a "from the cache" run)
- function and form tests AST-verify the parsed output against Acorn by default (`verifyAst: false` opts out, needed for unsupported syntax)
- Sourcemaps are compared too: if enabled, the `.js.map` files must be committed to `_expected` (they must be absent on both sides otherwise)

## chunking-form

- Compares `_actual/<format>/` directories against `_expected/<format>/`; `chunkFileNames: 'generated-[name].js'` is the default (overridable via `options.output`); `runAmd` can execute the AMD output; no automatic AST verification

## cli

- The suite copies `node_modules_rename_me` to `node_modules` at startup
- `command` runs in a shell with the literal `rollup` token replaced by `node <dist/bin/rollup>`; `spawnArgs`/`spawnScript` spawn directly instead
- Env gets `FORCE_COLOR: 0` injected; assertion priority: `after` → error handling → `stderr` → `execute` → `result` → `test()` → `_expected`/`_expected.js` comparison
