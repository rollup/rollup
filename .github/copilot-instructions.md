# GitHub Copilot Agent Instructions for Rollup

Keep instructions concise, only add non-obvious information. Proactively update .github/copilot-instructions.md to prevent future mistakes.

## Architecture

- TypeScript + Rust hybrid: Rust code in `rust/` (bindings_napi, bindings_wasm, parse_ast crates) called via `native.js` and `native.wasm.js`
- Tests run against full artifact only—no unit tests to allow easy refactoring of internal APIs
- Test cases in `test/*/samples/` are configured via `_config.js` files; focus tests with `solo: true`
- See CONTRIBUTING.md "How to write tests" for test type selection (function/form/chunking-form/cli/etc.)

## Development Workflow

- Quick iteration: `npm run update:js` (TS changes) or `npm run update:napi` (Rust changes), then `npm run test:only`
- Rust only: `npm run build:napi`

## Testing

- Always test edge cases, especially in core logic or build/test infrastructure
- Test names and descriptions use clear, descriptive language of the expected behavior, e.g. "description: 'does X when Y happens"

## Code Review Focus

- **Ignore style/linting issues** in test sample files (`test/*/samples/`) except for `_config.js` files
- Test samples intentionally violate best practices to test edge cases—do not flag style violations in these files
- Focus reviews on production code quality
