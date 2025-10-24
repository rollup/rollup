# GitHub Copilot Agent Instructions for Rollup

This is the Rollup project, a module bundler for JavaScript.

## Technology Stack & Frameworks

- The application is written in TypeScript but contains a growing part of Rust code located in the `rust` folder that is called from TypeScript.
- The website is a Vitepress project located in the `docs` folder.
- The build system uses Rollup for bundling the TypeScript code.

## Repository Structure

- TypeScript code is in the `src` directory. The entry points are `src/node-entry.ts` and `src/browser-entry.ts`.
- Tests are in the `test` directory, with subdirectories for different test types. Most test types have a `samples` subdirectory which in itself contains other folders, one for each test case. The test case is configured via a `_config.js` file in its folder. Additionally, `samples` can also include folders that contain no `_config.js` file but contain multiple sub-folders in tests to group related test cases. All tests run against the full Rollup artifact, there are no fine-grained unit tests to allow easy refactoring of internal APIs.
- Rust code is in the `rust` directory. It is grouped into the `bindings_napi` and `bindings_wasm` crates to interface with TypeScript via napi-rs or wasmpack, and the `parse_ast` crate that contains a parser for JavaScript that generates a binary AST format.
- Rust code is called via `native.js` and `native.wasm.js` in the `src` directory.
- Development scripts are in the `scripts` directory.
- Documentation is in the `docs` directory.

## Development Workflow

- In order to create a production build and run all tests, use `npm test`.
- For quicker development cycles
  - first run either `npm run update:js` if TypeScript code was updated, or `npm run update:napi` if Rust code was updated.
  - then run `npm run test:only` to only run tests against the built artifact without rebuilding.
  - you can focus specific tests by adding `solo: true´ in their `\_config.js` file.

## Copilot-Specific Behaviors

- Only make changes that are fully justified by project documentation or explicit user requests. When in doubt, prefer conservative actions and reference relevant documentation.
- Always consider and test for edge cases, especially when modifying core logic or build/test infrastructure.
