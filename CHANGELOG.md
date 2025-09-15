# rollup changelog

## 4.50.2

_2025-09-15_

### Bug Fixes

- Resolve an issue where unused destructured array pattern declarations would conflict with included variables (#6100)

### Pull Requests

- [#6100](https://github.com/rollup/rollup/pull/6100): Tree-shake un-included elements in array pattern (@TrickyPi)
- [#6102](https://github.com/rollup/rollup/pull/6102): chore(deps): update actions/setup-node action to v5 (@renovate[bot])
- [#6103](https://github.com/rollup/rollup/pull/6103): chore(deps): update dependency eslint-plugin-unicorn to v61 (@renovate[bot])
- [#6104](https://github.com/rollup/rollup/pull/6104): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#6105](https://github.com/rollup/rollup/pull/6105): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#6107](https://github.com/rollup/rollup/pull/6107): Improve CI stability (@lukastaegert)

## 4.50.1

_2025-09-07_

### Bug Fixes

- Resolve a situation where a destructuring default value was removed (#6090)

### Pull Requests

- [#6088](https://github.com/rollup/rollup/pull/6088): feat(www): shorter repl shareables (@cyyynthia, @lukastaegert)
- [#6090](https://github.com/rollup/rollup/pull/6090): Call includeNode for self or children nodes in includeDestructuredIfNecessary (@TrickyPi)
- [#6091](https://github.com/rollup/rollup/pull/6091): fix(deps): update rust crate swc_compiler_base to v33 (@renovate[bot])
- [#6092](https://github.com/rollup/rollup/pull/6092): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#6094](https://github.com/rollup/rollup/pull/6094): perf: replace startsWith with strict equality (@btea)

## 4.50.0

_2025-08-31_

### Features

- Support openharmony-arm64 platform (#6081)

### Bug Fixes

- Fix loading of extensionless imports in config files (#6084)

### Pull Requests

- [#6081](https://github.com/rollup/rollup/pull/6081): Add support for openharmony-arm64 platform (@hqzing, @lukastaegert)
- [#6084](https://github.com/rollup/rollup/pull/6084): Return null to defer to the default resolution behavior (@TrickyPi)

## 4.49.0

_2025-08-27_

### Features

- Allow config plugins to resolve imports first before deciding whether to treat them as external (#6038)

### Pull Requests

- [#6038](https://github.com/rollup/rollup/pull/6038): feat: Run external check in `cli/run/loadConfigFile.ts` as last in order to allow handling of e.g. workspace package imports in TS monorepos correctly (@stazz, @TrickyPi)
- [#6082](https://github.com/rollup/rollup/pull/6082): Improve build pipeline performance (@lukastaegert)

## 4.48.1

_2025-08-25_

### Bug Fixes

- Correctly ignore white-space in JSX strings around line-breaks (#6051)

### Pull Requests

- [#6051](https://github.com/rollup/rollup/pull/6051): fix: handle whitespace according to JSX common practice (@cyyynthia)
- [#6078](https://github.com/rollup/rollup/pull/6078): build: optimize pipeline take two (@cyyynthia)

## 4.48.0

_2025-08-23_

### Features

- If configured, also keep unparseable import attributes of external dynamic imports in the output(#6071)

### Bug Fixes

- Ensure variables referenced in non-removed import attributes are included (#6071)

### Pull Requests

- [#6071](https://github.com/rollup/rollup/pull/6071): Keep attributes for external dynamic imports (@TrickyPi)
- [#6079](https://github.com/rollup/rollup/pull/6079): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#6080](https://github.com/rollup/rollup/pull/6080): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.47.1

_2025-08-21_

### Bug Fixes

- Revert build process changes to investigate issues (#6077)

### Pull Requests

- [#6077](https://github.com/rollup/rollup/pull/6077): Revert "build: aggressively optimize wasm build, improve pipeline (#6053)" (@lukastaegert)

## 4.47.0

_2025-08-21_

### Features

- Aggressively reduce WASM build size (#6053)

### Bug Fixes

- Fix illegal instruction error on Android ARM platforms (#6072)
- Allow to pass explicit `undefined` for optional fields in Rollup types (#6061)

### Pull Requests

- [#6053](https://github.com/rollup/rollup/pull/6053): build: aggressively optimize wasm build, improve pipeline (@cyyynthia)
- [#6061](https://github.com/rollup/rollup/pull/6061): fix(types): add support for exactOptionalPropertyTypes (@remcohaszing, @lukastaegert)
- [#6072](https://github.com/rollup/rollup/pull/6072): build(rust): mimalloc-safe/no_opt_arch on aarch64 (@cyyynthia)

## 4.46.4

_2025-08-20_

### Bug Fixes

- Do not omit synthetic namespaces when only accessed via `in` operator (#6052)

### Pull Requests

- [#6052](https://github.com/rollup/rollup/pull/6052): fix: don't optimize `in` with `syntheticNamedExports` (@hi-ogawa)
- [#6074](https://github.com/rollup/rollup/pull/6074): Update transitive dependency to fix audit (@lukastaegert)

## 4.46.3

_2025-08-18_

### Bug Fixes

- Resolve illegal instruction error on arm64 architectures (#6055)
- Resolve sourcemap generation performance regression (#6057)

### Pull Requests

- [#6043](https://github.com/rollup/rollup/pull/6043): Avoid `generated by` comment diff on Windows (@sapphi-red)
- [#6048](https://github.com/rollup/rollup/pull/6048): chore(deps): update dependency cross-env to v10 (@renovate[bot], @lukastaegert)
- [#6049](https://github.com/rollup/rollup/pull/6049): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#6055](https://github.com/rollup/rollup/pull/6055): Fix illegal instruction error on arm64 by enabling `no_opt_arch` feature for mimalloc-safe (@sapphi-red)
- [#6057](https://github.com/rollup/rollup/pull/6057): fix: tweak the fallback logic for tracing segment (@TrickyPi, @lukastaegert)
- [#6062](https://github.com/rollup/rollup/pull/6062): docs: update Rust toolchain instructions (@situ2001, @lukastaegert)
- [#6063](https://github.com/rollup/rollup/pull/6063): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#6067](https://github.com/rollup/rollup/pull/6067): chore(deps): update actions/checkout action to v5 (@renovate[bot], @lukastaegert)
- [#6068](https://github.com/rollup/rollup/pull/6068): chore(deps): update actions/download-artifact action to v5 (@renovate[bot])
- [#6069](https://github.com/rollup/rollup/pull/6069): fix(deps): update rust crate swc_compiler_base to v31 (@renovate[bot], @lukastaegert)

## 4.46.2

_2025-07-29_

### Bug Fixes

- Fix in-operator handling for external namespace and when the left side cannot be analyzed (#6041)

### Pull Requests

- [#6041](https://github.com/rollup/rollup/pull/6041): Correct the logic of include in BinaryExpression and don't optimize external references away (@TrickyPi, @cyyynthia, @lukastaegert)

## 4.46.1

_2025-07-28_

### Bug Fixes

- Do not fail when using the `in` operator on external namespaces (#6036)

### Pull Requests

- [#6036](https://github.com/rollup/rollup/pull/6036): disables optimization for external namespace when using the in operator (@TrickyPi)

## 4.46.0

_2025-07-27_

### Features

- Optimize `in` checks on namespaces to keep them treeshake-able (#6029)

### Pull Requests

- [#5991](https://github.com/rollup/rollup/pull/5991): feat: update linux-loongarch64-gnu (@wojiushixiaobai, @lukastaegert)
- [#6029](https://github.com/rollup/rollup/pull/6029): feat: optimize `in` checks on namespaces to keep them treeshake-able (@cyyynthia, @lukastaegert)
- [#6033](https://github.com/rollup/rollup/pull/6033): fix(deps): update swc monorepo (major) (@renovate[bot], @lukastaegert)

## 4.45.3

_2025-07-26_

### Bug Fixes

- Do not fail build if a const is reassigned but warn instead (#6020)
- Fail with a helpful error message if an exported binding is not defined (#6023)

### Pull Requests

- [#6014](https://github.com/rollup/rollup/pull/6014): chore(deps): update dependency @vue/language-server to v3 (@renovate[bot])
- [#6015](https://github.com/rollup/rollup/pull/6015): chore(deps): update dependency vue-tsc to v3 (@renovate[bot], @lukastaegert)
- [#6016](https://github.com/rollup/rollup/pull/6016): fix(deps): update swc monorepo (major) (@renovate[bot], @lukastaegert)
- [#6017](https://github.com/rollup/rollup/pull/6017): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#6020](https://github.com/rollup/rollup/pull/6020): Make const reassignments only a warning (@lukastaegert)
- [#6023](https://github.com/rollup/rollup/pull/6023): Throw descriptive error message for used export is not defined (@TrickyPi)
- [#6027](https://github.com/rollup/rollup/pull/6027): feat: upgrade to NAPI-RS 3 stable (@Brooooooklyn)
- [#6028](https://github.com/rollup/rollup/pull/6028): Update eslint-plugin-unicorn to resolve vulnerability (@lukastaegert)
- [#6034](https://github.com/rollup/rollup/pull/6034): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)

## 4.45.1

_2025-07-15_

### Bug Fixes

- Resolve crash when using certain conditional expressions (#6009)

### Pull Requests

- [#6009](https://github.com/rollup/rollup/pull/6009): Add hasDeoptimizedCache flag for ConditionalExpression (@TrickyPi)

## 4.45.0

_2025-07-12_

### Features

- Improve tree-shaking when both branches of a conditional expression return the same boolean value (#6000)
- In environments that support both CJS and ESM, prefer the ESM build of Rollup (#6005)

### Bug Fixes

- Ensure static blocks do not prevent tree-shaking if they access `this` (#6001)

### Pull Requests

- [#6000](https://github.com/rollup/rollup/pull/6000): feat: improve get literal value for conditional expression (@ahabhgk, @lukastaegert)
- [#6001](https://github.com/rollup/rollup/pull/6001): Correct the parent scope for static blocks (@TrickyPi, @lukastaegert)
- [#6005](https://github.com/rollup/rollup/pull/6005): fix: export field order prefer esm (@DylanPiercey)

## 4.44.2

_2025-07-04_

### Bug Fixes

- Correctly handle `@__PURE__` annotations after `new` keyword (#5998)
- Generate correct source mapping for closing braces of block statements (#5999)

### Pull Requests

- [#5998](https://github.com/rollup/rollup/pull/5998): Support `@__PURE__` when nested after new in constructor invocations (@TrickyPi)
- [#5999](https://github.com/rollup/rollup/pull/5999): Add location info for closing brace of block statement (@TrickyPi)
- [#6002](https://github.com/rollup/rollup/pull/6002): chore(deps): update dependency vite to v7 (@renovate[bot], @lukastaegert)
- [#6004](https://github.com/rollup/rollup/pull/6004): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)

## 4.44.1

_2025-06-26_

### Bug Fixes

- Reinstate maxParallelFileOps limit of 1000 to resolve the issue for some (#5992)

### Pull Requests

- [#5988](https://github.com/rollup/rollup/pull/5988): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5992](https://github.com/rollup/rollup/pull/5992): Set maxParallelFileOps to 1000 (@lukastaegert)

## 4.44.0

_2025-06-19_

### Features

- Remove limit on `maxParallelFileOps` as this could break watch mode with the commonjs plugin (#5986)

### Bug Fixes

- Provide better source mappings when coarse intermediate maps are used (#5985)

### Pull Requests

- [#5984](https://github.com/rollup/rollup/pull/5984): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5985](https://github.com/rollup/rollup/pull/5985): Improve approximation of coarse sourcemap segments (@TrickyPi)
- [#5986](https://github.com/rollup/rollup/pull/5986): Remove limit on max parallel file ops (@lukastaegert)

## 4.43.0

_2025-06-11_

### Features

- Provide new `fs` option and `this.fs` API to replace file system (#5944)

### Pull Requests

- [#5944](https://github.com/rollup/rollup/pull/5944): feat(options): Add an option for overriding the file system module in the JS API (@EggDice, @lukastaegert)

## 4.42.0

_2025-06-06_

### Features

- Add option to allow the input to be located in the output in watch mode (#5966)

### Pull Requests

- [#5966](https://github.com/rollup/rollup/pull/5966): feat: watch mode add `allowInputInsideOutputPath` option (@btea, @lukastaegert)

## 4.41.2

_2025-06-06_

### Bug Fixes

- Detect named export usages in dynamic imports with `then` and non-arrow function expressions (#5977)
- Do not replace usages of constant variables with their values for readability (#5968)

### Pull Requests

- [#5968](https://github.com/rollup/rollup/pull/5968): fix: preserve constant identifiers in unary expressions instead of magic numbers (@OmkarJ13, @lukastaegert)
- [#5969](https://github.com/rollup/rollup/pull/5969): chore(deps): update dependency yargs-parser to v22 (@renovate[bot], @lukastaegert)
- [#5970](https://github.com/rollup/rollup/pull/5970): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5971](https://github.com/rollup/rollup/pull/5971): chore(deps): lock file maintenance (@renovate[bot])
- [#5976](https://github.com/rollup/rollup/pull/5976): Update README.md (@ftlno, @lukastaegert)
- [#5977](https://github.com/rollup/rollup/pull/5977): fix: consider function expression in thenable when tree-shaking dynamic imports (@TrickyPi)
- [#5981](https://github.com/rollup/rollup/pull/5981): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5982](https://github.com/rollup/rollup/pull/5982): Debug/fix watch pipeline (@lukastaegert)

## 4.41.1

_2025-05-24_

### Bug Fixes

- If a plugin calls `this.resolve` with `skipSelf: true`, subsequent calls when handling this by the same plugin with same parameters will return `null` to avoid infinite recursions (#5945)

### Pull Requests

- [#5945](https://github.com/rollup/rollup/pull/5945): Avoid recursively calling a plugin's resolveId hook with same id and importer (@younggglcy, @lukastaegert)
- [#5963](https://github.com/rollup/rollup/pull/5963): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#5964](https://github.com/rollup/rollup/pull/5964): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.41.0

_2025-05-18_

### Features

- Detect named exports in more dynamic import scenarios (#5954)

### Pull Requests

- [#5949](https://github.com/rollup/rollup/pull/5949): ci: use node 24 (@btea, @lukastaegert)
- [#5951](https://github.com/rollup/rollup/pull/5951): chore(deps): update dependency pretty-bytes to v7 (@renovate[bot])
- [#5952](https://github.com/rollup/rollup/pull/5952): fix(deps): update swc monorepo (major) (@renovate[bot], @lukastaegert)
- [#5953](https://github.com/rollup/rollup/pull/5953): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5954](https://github.com/rollup/rollup/pull/5954): enhance tree-shaking for dynamic imports (@TrickyPi, @renovate[bot], @lukastaegert)
- [#5957](https://github.com/rollup/rollup/pull/5957): chore(deps): update dependency lint-staged to v16 (@renovate[bot], @lukastaegert)
- [#5958](https://github.com/rollup/rollup/pull/5958): fix(deps): update rust crate swc_compiler_base to v20 (@renovate[bot], @lukastaegert)
- [#5959](https://github.com/rollup/rollup/pull/5959): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5960](https://github.com/rollup/rollup/pull/5960): Use spawn to run CLI tests (@lukastaegert)

## 4.40.2

_2025-05-06_

### Bug Fixes

- Create correct IIFE/AMD/UMD bundles when using a mutable default export (#5934)
- Fix execution order when using top-level await for dynamic imports with inlineDynamicImports (#5937)
- Throw when the output is watched in watch mode (#5939)

### Pull Requests

- [#5934](https://github.com/rollup/rollup/pull/5934): fix(exports): avoid "exports is not defined" `ReferenceError` (@dasa)
- [#5937](https://github.com/rollup/rollup/pull/5937): consider TLA imports have higher execution priority (@TrickyPi)
- [#5939](https://github.com/rollup/rollup/pull/5939): fix: watch mode input should not be an output subpath (@btea)
- [#5940](https://github.com/rollup/rollup/pull/5940): chore(deps): update dependency vite to v6.3.4 [security] (@renovate[bot])
- [#5941](https://github.com/rollup/rollup/pull/5941): chore(deps): update dependency eslint-plugin-unicorn to v59 (@renovate[bot])
- [#5942](https://github.com/rollup/rollup/pull/5942): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5943](https://github.com/rollup/rollup/pull/5943): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.40.1

_2025-04-28_

### Bug Fixes

- Limit hash size for asset file names to the supported 21 (#5921)
- Do not inline user-defined entry chunks or chunks with explicit file name (#5923)
- Avoid top-level-await cycles when non-entry chunks use top-level await (#5930)
- Expose package.json via exports (#5931)

### Pull Requests

- [#5921](https://github.com/rollup/rollup/pull/5921): fix(assetFileNames): reduce max hash size to 21 (@shulaoda)
- [#5923](https://github.com/rollup/rollup/pull/5923): fix: generate the separate chunk for the entry module with explicated chunk filename or name (@TrickyPi)
- [#5926](https://github.com/rollup/rollup/pull/5926): fix(deps): update rust crate swc_compiler_base to v18 (@renovate[bot])
- [#5927](https://github.com/rollup/rollup/pull/5927): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5928](https://github.com/rollup/rollup/pull/5928): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5930](https://github.com/rollup/rollup/pull/5930): Avoid chunks TLA dynamic import circular when TLA dynamic import used in non-entry modules (@TrickyPi)
- [#5931](https://github.com/rollup/rollup/pull/5931): chore: add new `./package.json` entry (@JounQin, @lukastaegert)
- [#5936](https://github.com/rollup/rollup/pull/5936): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.40.0

_2025-04-12_

### Features

- Only show `eval` warnings on first render and only when the call is not tree-shaken (#5892)
- Tree-shake non-included dynamic import members when the handler just maps to one named export (#5898)

### Bug Fixes

- Consider dynamic imports nested within top-level-awaited dynamic import expressions to be awaited as well (#5900)
- Fix namespace rendering when tree-shaking is disabled (#5908)
- When using multiple transform hook filters, all of them need to be satisfied together (#5909)

### Pull Requests

- [#5892](https://github.com/rollup/rollup/pull/5892): Warn when eval or namespace calls are rendered, not when they are parsed (@SunsetFi, @lukastaegert)
- [#5898](https://github.com/rollup/rollup/pull/5898): feat: treeshake dynamic import chained member expression (@privatenumber, @lukastaegert)
- [#5900](https://github.com/rollup/rollup/pull/5900): consider the dynamic import within a TLA call expression as a TLA import (@TrickyPi)
- [#5904](https://github.com/rollup/rollup/pull/5904): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#5905](https://github.com/rollup/rollup/pull/5905): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5908](https://github.com/rollup/rollup/pull/5908): Fix `treeshake: false` breaking destructured namespace imports (@Skn0tt)
- [#5909](https://github.com/rollup/rollup/pull/5909): Correct the behavior when multiple transform filter options are specified (@sapphi-red)
- [#5915](https://github.com/rollup/rollup/pull/5915): chore(deps): update dependency @types/picomatch to v4 (@renovate[bot])
- [#5916](https://github.com/rollup/rollup/pull/5916): fix(deps): update rust crate swc_compiler_base to v17 (@renovate[bot])
- [#5917](https://github.com/rollup/rollup/pull/5917): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5918](https://github.com/rollup/rollup/pull/5918): chore(deps): update dependency vite to v6.2.6 [security] (@renovate[bot], @lukastaegert)

## 4.39.0

_2025-04-02_

### Features

- Do not create separate facade chunks if a chunk would contain several entry modules that allow export extension if there are no export name conflicts (#5891)

### Bug Fixes

- Mark the `id` property as optional in the filter for the `resolveId` hook (#5896)

### Pull Requests

- [#5891](https://github.com/rollup/rollup/pull/5891): chunk: merge allow-extension modules (@wmertens, @lukastaegert)
- [#5893](https://github.com/rollup/rollup/pull/5893): chore(deps): update dependency vite to v6.2.4 [security] (@renovate[bot])
- [#5896](https://github.com/rollup/rollup/pull/5896): fix: resolveId id filter is optional (@sapphi-red)

## 4.38.0

_2025-03-29_

### Features

- Support `.filter` option in `resolveId`, `load` and `transform` hooks (#5882)

### Pull Requests

- [#5882](https://github.com/rollup/rollup/pull/5882): Add support for hook filters (@sapphi-red)
- [#5894](https://github.com/rollup/rollup/pull/5894): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5895](https://github.com/rollup/rollup/pull/5895): chore(deps): update dependency eslint-plugin-unicorn to v58 (@renovate[bot])

## 4.37.0

_2025-03-23_

### Features

- Support Musl Linux on Riscv64 architectures (#5726)
- Handles class decorators placed before the `export` keyword (#5871)

### Bug Fixes

- Log Rust panic messages to the console when using the WASM build (#5875)

### Pull Requests

- [#5726](https://github.com/rollup/rollup/pull/5726): Add support for linux riscv64 musl (@fossdd, @leso-kn)
- [#5871](https://github.com/rollup/rollup/pull/5871): feat: support decorators before or after export (@TrickyPi)
- [#5875](https://github.com/rollup/rollup/pull/5875): capture Rust panic messages and output them to the console. (@luyahan, @lukastaegert)
- [#5883](https://github.com/rollup/rollup/pull/5883): Pin digest of 3rd party actions (@re-taro)
- [#5885](https://github.com/rollup/rollup/pull/5885): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.36.0

_2025-03-17_

### Features

- Extend `renderDynamicImport` hook to provide information about static dependencies of the imported module (#5870)
- Export several additional types used by Vite (#5879)

### Bug Fixes

- Do not merge chunks if that would create a top-level await cycle between chunks (#5843)

### Pull Requests

- [#5843](https://github.com/rollup/rollup/pull/5843): avoiding top level await circular (@TrickyPi, @lukastaegert)
- [#5870](https://github.com/rollup/rollup/pull/5870): draft for extended renderDynamicImport hook (@iczero, @lukastaegert)
- [#5876](https://github.com/rollup/rollup/pull/5876): Update axios overrides to 1.8.2 (@vadym-khodak)
- [#5877](https://github.com/rollup/rollup/pull/5877): chore(deps): update dependency eslint-plugin-vue to v10 (@renovate[bot])
- [#5878](https://github.com/rollup/rollup/pull/5878): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5879](https://github.com/rollup/rollup/pull/5879): fix: export types (@sxzz)

## 4.35.0

_2025-03-08_

### Features

- Pass build errors to the closeBundle hook (#5867)

### Pull Requests

- [#5852](https://github.com/rollup/rollup/pull/5852): chore(deps): update dependency eslint-plugin-unicorn to v57 (@renovate[bot], @lukastaegert)
- [#5862](https://github.com/rollup/rollup/pull/5862): fix(deps): update swc monorepo (major) (@renovate[bot], @lukastaegert)
- [#5867](https://github.com/rollup/rollup/pull/5867): feat(5858): make closeBundle hook receive the last error (@GauBen)
- [#5872](https://github.com/rollup/rollup/pull/5872): chore(deps): update dependency builtin-modules to v5 (@renovate[bot])
- [#5873](https://github.com/rollup/rollup/pull/5873): chore(deps): update uraimo/run-on-arch-action action to v3 (@renovate[bot])
- [#5874](https://github.com/rollup/rollup/pull/5874): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.34.9

_2025-03-01_

### Bug Fixes

- Support JSX modes in WASM (#5866)
- Allow the CustomPluginOptions to be extended (#5850)

### Pull Requests

- [#5850](https://github.com/rollup/rollup/pull/5850): Revert CustomPluginOptions to be an interface (@sapphi-red, @lukastaegert)
- [#5851](https://github.com/rollup/rollup/pull/5851): Javascript to JavaScript (@dasa, @lukastaegert)
- [#5853](https://github.com/rollup/rollup/pull/5853): chore(deps): update dependency pinia to v3 (@renovate[bot])
- [#5854](https://github.com/rollup/rollup/pull/5854): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#5855](https://github.com/rollup/rollup/pull/5855): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5860](https://github.com/rollup/rollup/pull/5860): chore(deps): update dependency @shikijs/vitepress-twoslash to v3 (@renovate[bot])
- [#5861](https://github.com/rollup/rollup/pull/5861): chore(deps): update dependency globals to v16 (@renovate[bot])
- [#5863](https://github.com/rollup/rollup/pull/5863): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5864](https://github.com/rollup/rollup/pull/5864): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5866](https://github.com/rollup/rollup/pull/5866): Add jsx parameter to parseAsync in native.wasm.js (@TrickyPi)

## 4.34.8

_2025-02-17_

### Bug Fixes

- Do not make assumptions about the value of nested paths in logical expressions if the expression cannot be simplified (#5846)

### Pull Requests

- [#5846](https://github.com/rollup/rollup/pull/5846): return UnknownValue if the usedbranch is unkown and the path is not empty (@TrickyPi)

## 4.34.7

_2025-02-14_

### Bug Fixes

- Ensure that calls to parameters are included correctly when using try-catch deoptimization (#5842)

### Pull Requests

- [#5840](https://github.com/rollup/rollup/pull/5840): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5842](https://github.com/rollup/rollup/pull/5842): Fix prop inclusion with try-catch-deoptimization (@lukastaegert)

## 4.34.6

_2025-02-07_

### Bug Fixes

- Retain "void 0" in the output for smaller output and fewer surprises (#5838)

### Pull Requests

- [#5835](https://github.com/rollup/rollup/pull/5835): fix(deps): update swc monorepo (major) (@renovate[bot], @lukastaegert)
- [#5838](https://github.com/rollup/rollup/pull/5838): replace undefined with void 0 for operator void (@TrickyPi)

## 4.34.5

_2025-02-07_

### Bug Fixes

- Ensure namespace reexports always include all properties of all exports (#5837)

### Pull Requests

- [#5836](https://github.com/rollup/rollup/pull/5836): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5837](https://github.com/rollup/rollup/pull/5837): Include all paths of reexports if namespace is used (@lukastaegert)

## 4.34.4

_2025-02-05_

### Bug Fixes

- Do not tree-shake properties if a rest element is used in destructuring (#5833)

### Pull Requests

- [#5833](https://github.com/rollup/rollup/pull/5833): include all properties if a rest element is destructed (@TrickyPi)

## 4.34.3

_2025-02-05_

### Bug Fixes

- Ensure properties of "this" are included in getters (#5831)

### Pull Requests

- [#5831](https://github.com/rollup/rollup/pull/5831): include the properties that accessed by this (@TrickyPi)

## 4.34.2

_2025-02-04_

### Bug Fixes

- Fix an issue where not all usages of a function were properly detected (#5827)

### Pull Requests

- [#5827](https://github.com/rollup/rollup/pull/5827): Ensure that functions provided to a constructor are properly deoptimized (@lukastaegert)

## 4.34.1

_2025-02-03_

### Bug Fixes

- Ensure throwing objects includes the entire object (#5825)

### Pull Requests

- [#5825](https://github.com/rollup/rollup/pull/5825): Ensure that all properties of throw statements are included (@lukastaegert)

## 4.34.0

_2025-02-01_

### Features

- Tree-shake unused properties in object literals (re-implements #5420) (#5737)

### Pull Requests

- [#5737](https://github.com/rollup/rollup/pull/5737): Reapply object tree-shaking (@lukastaegert, @TrickyPi)

## 4.33.0

_2025-02-01_

### Features

- Correctly detect literal value of more negated expressions (#5812)

### Bug Fixes

- Use the correct with/assert attribute key in dynamic imports (#5818)
- Fix an issue where logical expressions were considered to have the wrong value (#5819)

### Pull Requests

- [#5812](https://github.com/rollup/rollup/pull/5812): feat: optimize the literal value of unary expressions (@TrickyPi)
- [#5816](https://github.com/rollup/rollup/pull/5816): fix(deps): update swc monorepo (major) (@renovate[bot], @lukastaegert)
- [#5817](https://github.com/rollup/rollup/pull/5817): fix(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5818](https://github.com/rollup/rollup/pull/5818): support for changing the attributes key for dynamic imports (@TrickyPi)
- [#5819](https://github.com/rollup/rollup/pull/5819): Return UnknownValue if getLiteralValueAtPath is called recursively within logical expressions (@TrickyPi)
- [#5820](https://github.com/rollup/rollup/pull/5820): return null (@kingma-sbw)

## 4.32.1

_2025-01-28_

### Bug Fixes

- Fix possible crash when optimizing logical expressions (#5804)

### Pull Requests

- [#5804](https://github.com/rollup/rollup/pull/5804): fix: set hasDeoptimizedCache to true as early as possible (@TrickyPi)
- [#5813](https://github.com/rollup/rollup/pull/5813): Fix typo (@kantuni)

## 4.32.0

_2025-01-24_

### Features

- Add watch.onInvalidate option to trigger actions immediately when a file is changed (#5799)

### Bug Fixes

- Fix incorrect urls in CLI warnings (#5809)

### Pull Requests

- [#5799](https://github.com/rollup/rollup/pull/5799): Feature/watch on invalidate (@drebrez, @lukastaegert)
- [#5808](https://github.com/rollup/rollup/pull/5808): chore(deps): update dependency vite to v6.0.9 [security] (@renovate[bot])
- [#5809](https://github.com/rollup/rollup/pull/5809): fix: avoid duplicate rollupjs.org prefix (@GauBen, @lukastaegert)
- [#5810](https://github.com/rollup/rollup/pull/5810): chore(deps): update dependency @shikijs/vitepress-twoslash to v2 (@renovate[bot])
- [#5811](https://github.com/rollup/rollup/pull/5811): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.31.0

_2025-01-19_

### Features

- Do not immediately quit when trying to use watch mode from within non-TTY environments (#5803)

### Bug Fixes

- Handle files with more than one UTF-8 BOM header (#5806)

### Pull Requests

- [#5792](https://github.com/rollup/rollup/pull/5792): fix(deps): update rust crate swc_compiler_base to v8 (@renovate[bot])
- [#5793](https://github.com/rollup/rollup/pull/5793): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5794](https://github.com/rollup/rollup/pull/5794): chore(deps): lock file maintenance (@renovate[bot])
- [#5801](https://github.com/rollup/rollup/pull/5801): chore(deps): update dependency eslint-config-prettier to v10 (@renovate[bot])
- [#5802](https://github.com/rollup/rollup/pull/5802): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5803](https://github.com/rollup/rollup/pull/5803): Support watch mode in yarn, gradle and containers (@lukastaegert)
- [#5806](https://github.com/rollup/rollup/pull/5806): fix: strip all BOMs (@TrickyPi)

## 4.30.1

_2025-01-07_

### Bug Fixes

- Prevent invalid code when simplifying unary expressions in switch cases (#5786)

### Pull Requests

- [#5786](https://github.com/rollup/rollup/pull/5786): fix: consider that literals cannot following switch case. (@TrickyPi)

## 4.30.0

_2025-01-06_

### Features

- Inline values of resolvable unary expressions for improved tree-shaking (#5775)

### Pull Requests

- [#5775](https://github.com/rollup/rollup/pull/5775): feat: enhance the treehshaking for unary expression (@TrickyPi)
- [#5783](https://github.com/rollup/rollup/pull/5783): Improve CI caching for node_modules (@lukastaegert)

## 4.29.2

_2025-01-05_

### Bug Fixes

- Keep import attributes when using dynamic ESM `import()` expressions from CommonJS (#5781)

### Pull Requests

- [#5772](https://github.com/rollup/rollup/pull/5772): Improve caching on CI (@lukastaegert)
- [#5773](https://github.com/rollup/rollup/pull/5773): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5780](https://github.com/rollup/rollup/pull/5780): feat: use picocolors instead of colorette (@re-taro)
- [#5781](https://github.com/rollup/rollup/pull/5781): fix: keep import attributes for cjs format (@TrickyPi)

## 4.29.1

_2024-12-21_

### Bug Fixes

- Fix crash from deoptimized logical expressions (#5771)

### Pull Requests

- [#5769](https://github.com/rollup/rollup/pull/5769): Remove unnecessary lifetimes (@lukastaegert)
- [#5771](https://github.com/rollup/rollup/pull/5771): fix: do not optimize the literal value if the cache is deoptimized (@TrickyPi)

## 4.29.0

_2024-12-20_

### Features

- Treat objects as truthy and always check second argument to better simplify logical expressions (#5763)

### Pull Requests

- [#5759](https://github.com/rollup/rollup/pull/5759): docs: add utf-8 encoding to JSON file reading (@chouchouji)
- [#5760](https://github.com/rollup/rollup/pull/5760): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5763](https://github.com/rollup/rollup/pull/5763): fix: introduce UnknownFalsyValue for enhancing if statement tree-shaking (@TrickyPi)
- [#5766](https://github.com/rollup/rollup/pull/5766): chore(deps): update dependency @rollup/plugin-node-resolve to v16 (@renovate[bot])
- [#5767](https://github.com/rollup/rollup/pull/5767): fix(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.28.1

_2024-12-06_

### Bug Fixes

- Support running Rollup natively on LoongArch (#5749)
- Add optional `debugId` to `SourceMap` types (#5751)

### Pull Requests

- [#5749](https://github.com/rollup/rollup/pull/5749): feat: add support for LoongArch (@darkyzhou)
- [#5751](https://github.com/rollup/rollup/pull/5751): feat: Add `debugId` to `SourceMap` types (@timfish, @lukastaegert)
- [#5752](https://github.com/rollup/rollup/pull/5752): chore(deps): update dependency mocha to v11 (@renovate[bot])
- [#5753](https://github.com/rollup/rollup/pull/5753): chore(deps): update dependency vite to v6 (@renovate[bot])
- [#5754](https://github.com/rollup/rollup/pull/5754): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#5755](https://github.com/rollup/rollup/pull/5755): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5756](https://github.com/rollup/rollup/pull/5756): Test if saving the Cargo cache can speed up FreeBSD (@lukastaegert)

## 4.28.0

_2024-11-30_

### Features

- Allow to specify how to handle import attributes when transpiling Rollup config files (#5743)

### Pull Requests

- [#5743](https://github.com/rollup/rollup/pull/5743): fix: supports modify the import attributes key in the config file (@TrickyPi, @lukastaegert)
- [#5747](https://github.com/rollup/rollup/pull/5747): chore(deps): update codecov/codecov-action action to v5 (@renovate[bot])
- [#5748](https://github.com/rollup/rollup/pull/5748): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.27.4

_2024-11-23_

### Bug Fixes

- Update bundled magic-string to support sourcemap debug ids (#5740)

### Pull Requests

- [#5740](https://github.com/rollup/rollup/pull/5740): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.27.3

_2024-11-18_

### Bug Fixes

- Revert object property tree-shaking for now (#5736)

### Pull Requests

- [#5736](https://github.com/rollup/rollup/pull/5736): Revert object tree-shaking until some issues have been resolved (@lukastaegert)

## 4.27.2

_2024-11-15_

### Bug Fixes

- Ensure unused variables in patterns are always deconflicted if rendered (#5728)

### Pull Requests

- [#5728](https://github.com/rollup/rollup/pull/5728): Fix more variable deconflicting issues (@lukastaegert)

## 4.27.1

_2024-11-15_

### Bug Fixes

- Fix some situations where parameter declarations could put Rollup into an infinite loop (#5727)

### Pull Requests

- [#5727](https://github.com/rollup/rollup/pull/5727): Debug out-of-memory issues with Rollup v4.27.0 (@lukastaegert)

## 4.27.0

_2024-11-15_

### Features

- Tree-shake unused properties in object literals (#5420)

### Bug Fixes

- Change hash length limit to 21 to avoid inconsistent hash length (#5423)

### Pull Requests

- [#5420](https://github.com/rollup/rollup/pull/5420): feat: implement object tree-shaking (@TrickyPi, @lukastaegert)
- [#5723](https://github.com/rollup/rollup/pull/5723): Reduce max hash size to 21 (@lukastaegert)
- [#5724](https://github.com/rollup/rollup/pull/5724): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#5725](https://github.com/rollup/rollup/pull/5725): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.26.0

_2024-11-13_

### Features

- Allow to avoid `await bundle.close()` via explicit resource management in TypeScript (#5721)

### Pull Requests

- [#5721](https://github.com/rollup/rollup/pull/5721): feat: support `using` for `RollupBuild` (@shulaoda)

## 4.25.0

_2024-11-09_

### Features

- Add `output.sourcemapDebugIds` option to add matching debug ids to sourcemaps and code for tools like Sentry or Rollbar (#5712)

### Bug Fixes

- Make it easier to manually reproduce base16 hashes by using a more standard base16 conversion algorithm (#5719)

### Pull Requests

- [#5712](https://github.com/rollup/rollup/pull/5712): feat: Add support for injecting Debug IDs (@timfish)
- [#5717](https://github.com/rollup/rollup/pull/5717): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#5718](https://github.com/rollup/rollup/pull/5718): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5719](https://github.com/rollup/rollup/pull/5719): Use a less surprising base-16 encoding (@lukastaegert)

## 4.24.4

_2024-11-04_

### Bug Fixes

- Ensure mutations by handlers in Proxy definitions are always respected when tree-shaking (#5713)

### Pull Requests

- [#5708](https://github.com/rollup/rollup/pull/5708): Update configuration-options document (@sacru2red, @lukastaegert)
- [#5711](https://github.com/rollup/rollup/pull/5711): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5713](https://github.com/rollup/rollup/pull/5713): fix: Deoptimize the proxied object if its property is reassigned in the handler functions (@TrickyPi)

## 4.24.3

_2024-10-29_

### Bug Fixes

- Slightly reduce memory consumption by specifying fixed array sizes where possible (#5703)

### Pull Requests

- [#5703](https://github.com/rollup/rollup/pull/5703): perf: use pre-allocated arrays for known result sizes (@GalacticHypernova)

## 4.24.2

_2024-10-27_

### Bug Fixes

- Add missing build dependency (#5705)

### Pull Requests

- [#5705](https://github.com/rollup/rollup/pull/5705): Fix "Couldn't find package" error when installing rollup using yarn (@tagattie)

## 4.24.1

_2024-10-27_

### Bug Fixes

- Support running Rollup natively on FreeBSD (#5698)

### Pull Requests

- [#5689](https://github.com/rollup/rollup/pull/5689): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5690](https://github.com/rollup/rollup/pull/5690): chore(deps): update dependency @inquirer/prompts to v7 (@renovate[bot])
- [#5691](https://github.com/rollup/rollup/pull/5691): chore(deps): update dependency eslint-plugin-unicorn to v56 (@renovate[bot])
- [#5692](https://github.com/rollup/rollup/pull/5692): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5695](https://github.com/rollup/rollup/pull/5695): fix(deps): update swc monorepo (major) (@renovate[bot])
- [#5696](https://github.com/rollup/rollup/pull/5696): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5698](https://github.com/rollup/rollup/pull/5698): Add support for FreeBSD (x64 and arm64) (@tagattie, @lukastaegert)

## 4.24.0

_2024-10-02_

### Features

- Support preserving and transpiling JSX syntax (#5668)

### Pull Requests

- [#5668](https://github.com/rollup/rollup/pull/5668): Introduce JSX support (@lukastaegert, @Martin-Idel, @felixhuttmann, @AlexDroll, @tiptr)

## 4.23.0

_2024-10-01_

### Features

- Collect all emitted names and originalFileNames for assets (#5686)

### Pull Requests

- [#5686](https://github.com/rollup/rollup/pull/5686): Add names and originalFileNames to assets (@lukastaegert)

## 4.22.5

_2024-09-27_

### Bug Fixes

- Allow parsing of certain unicode characters again (#5674)

### Pull Requests

- [#5674](https://github.com/rollup/rollup/pull/5674): Fix panic with unicode characters (@sapphi-red, @lukastaegert)
- [#5675](https://github.com/rollup/rollup/pull/5675): chore(deps): update dependency rollup to v4.22.4 [security] (@renovate[bot])
- [#5680](https://github.com/rollup/rollup/pull/5680): chore(deps): update dependency @rollup/plugin-commonjs to v28 (@renovate[bot], @lukastaegert)
- [#5681](https://github.com/rollup/rollup/pull/5681): chore(deps): update dependency @rollup/plugin-replace to v6 (@renovate[bot])
- [#5682](https://github.com/rollup/rollup/pull/5682): chore(deps): update dependency @rollup/plugin-typescript to v12 (@renovate[bot])
- [#5684](https://github.com/rollup/rollup/pull/5684): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 2.79.2

_2024-09-26_

### Bug Fixes

- Fix a vulnerability in generated code that affects IIFE, UMD and CJS bundles when run in a browser context (#5671)

### Pull Requests

- [#5671](https://github.com/rollup/rollup/pull/5671): Fix DOM Clobbering CVE (@lukastaegert)

## 3.29.5

_2024-09-21_

### Bug Fixes

- Fix a vulnerability in generated code that affects IIFE, UMD and CJS bundles when run in a browser context (#5671)

### Pull Requests

- [#5671](https://github.com/rollup/rollup/pull/5671): Fix DOM Clobbering CVE (@lukastaegert)

## 4.22.4

_2024-09-21_

### Bug Fixes

- Fix a vulnerability in generated code that affects IIFE, UMD and CJS bundles when run in a browser context (#5671)

### Pull Requests

- [#5670](https://github.com/rollup/rollup/pull/5670): refactor: Use object.prototype to check for reserved properties (@YuHyeonWook)
- [#5671](https://github.com/rollup/rollup/pull/5671): Fix DOM Clobbering CVE (@lukastaegert)

## 4.22.3

_2024-09-21_

### Bug Fixes

- Ensure that mutations in modules without side effects are observed while properly handling transitive dependencies (#5669)

### Pull Requests

- [#5669](https://github.com/rollup/rollup/pull/5669): Ensure impure dependencies of pure modules are added (@lukastaegert)

## 4.22.2

_2024-09-20_

### Bug Fixes

- Revert fix for side effect free modules until other issues are investigated (#5667)

### Pull Requests

- [#5667](https://github.com/rollup/rollup/pull/5667): Partially revert #5658 and re-apply #5644 (@lukastaegert)

## 4.22.1

_2024-09-20_

### Bug Fixes

- Revert #5644 "stable chunk hashes" while issues are being investigated

### Pull Requests

- [#5663](https://github.com/rollup/rollup/pull/5663): chore(deps): update dependency inquirer to v11 (@renovate[bot], @lukastaegert)
- [#5664](https://github.com/rollup/rollup/pull/5664): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5665](https://github.com/rollup/rollup/pull/5665): fix: type in CI file (@YuHyeonWook)
- [#5666](https://github.com/rollup/rollup/pull/5666): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])

## 4.22.0

_2024-09-19_

### Features

- Add additional known global values to avoid access side effects (#5651)

### Bug Fixes

- Ensure deterministic chunk hash generation despite async renderChunk hook (#5644)
- Improve side effect detection when using "smallest" treeshaking preset when imports are optimized away (#5658)

### Pull Requests

- [#5644](https://github.com/rollup/rollup/pull/5644): fix: apply final hashes deterministically with stable placeholders set (@mattkubej, @lukastaegert)
- [#5646](https://github.com/rollup/rollup/pull/5646): chore(deps): update dependency @mermaid-js/mermaid-cli to v11 (@renovate[bot])
- [#5647](https://github.com/rollup/rollup/pull/5647): chore(deps): update dependency concurrently to v9 (@renovate[bot])
- [#5648](https://github.com/rollup/rollup/pull/5648): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5651](https://github.com/rollup/rollup/pull/5651): feat: add `AggregateError`, `FinalizationRegistry`, `WeakRef` to knownGlobals (@re-taro)
- [#5653](https://github.com/rollup/rollup/pull/5653): Fix example selection in REPL (@lukastaegert)
- [#5657](https://github.com/rollup/rollup/pull/5657): chore(deps): update dependency vite to v5.4.6 [security] (@renovate[bot])
- [#5658](https://github.com/rollup/rollup/pull/5658): Detect variable reassignments in modules without side effects (@lukastaegert)

## 4.21.3

_2024-09-12_

### Bug Fixes

- Always respect side effects in left-hand side of optional chain (#5642)
- Update stack trace for augmented errors to not hide relevant information (#5640)

### Pull Requests

- [#5636](https://github.com/rollup/rollup/pull/5636): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5637](https://github.com/rollup/rollup/pull/5637): chore(deps): lock file maintenance (@renovate[bot])
- [#5640](https://github.com/rollup/rollup/pull/5640): fix: keep the message of stack up-to-date (@TrickyPi)
- [#5642](https://github.com/rollup/rollup/pull/5642): fix: include left-side effect of optional chaining in the end of hasEffectsAsChainElement (@TrickyPi)

## 4.21.2

_2024-08-30_

### Bug Fixes

- Handle IIFE/UMD namespace definitions conflicting with a builtin property (#5605)

### Pull Requests

- [#5605](https://github.com/rollup/rollup/pull/5605): fix: Wrong namespace property definition (@thirumurugan-git, @lukastaegert)
- [#5630](https://github.com/rollup/rollup/pull/5630): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5631](https://github.com/rollup/rollup/pull/5631): chore(deps): lock file maintenance (@renovate[bot])
- [#5632](https://github.com/rollup/rollup/pull/5632): chore(deps): lock file maintenance (@renovate[bot])

## 4.21.1

_2024-08-26_

### Bug Fixes

- Ensure `closeWatcher` hook is called when watch mode is aborted via Ctrl+C (#5618)
- Do not produce invalid code for `import.meta.url` in compact mode (#5624)
- Do not throw when generating chunk names when preserving modules in Windows (#5625)

### Pull Requests

- [#5591](https://github.com/rollup/rollup/pull/5591): chore(deps): update dependency @types/eslint to v9 (@renovate[bot], @lukastaegert)
- [#5618](https://github.com/rollup/rollup/pull/5618): preload the WASM file even though the version is undefined. (@TrickyPi)
- [#5619](https://github.com/rollup/rollup/pull/5619): Call and await closeWatcher hooks on exit signals (@lukastaegert)
- [#5622](https://github.com/rollup/rollup/pull/5622): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5624](https://github.com/rollup/rollup/pull/5624): fix: add space for DOCUMENT_CURRENT_SCRIPT template (@TrickyPi)
- [#5625](https://github.com/rollup/rollup/pull/5625): fix: get the right chunk name for preserve modules in Windows (@TrickyPi, @lukastaegert)

## 4.21.0

_2024-08-18_

### Features

- Add option to configure directory for virtual modules when preserving modules (#5602)

### Pull Requests

- [#5602](https://github.com/rollup/rollup/pull/5602): feat: introduce the virtualDirname option to customize the virtual directory name (@TrickyPi)
- [#5607](https://github.com/rollup/rollup/pull/5607): chore(deps): update typescript-eslint monorepo to v8 (major) (@renovate[bot], @lukastaegert)
- [#5608](https://github.com/rollup/rollup/pull/5608): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5611](https://github.com/rollup/rollup/pull/5611): chore: fix the `noConflict` option in REPL. (@7086cmd)
- [#5613](https://github.com/rollup/rollup/pull/5613): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5614](https://github.com/rollup/rollup/pull/5614): chore(deps): lock file maintenance (@renovate[bot])

## 4.20.0

_2024-08-03_

### Features

- Allow plugins to specify the original file name when emitting assets (#5596)

### Pull Requests

- [#5596](https://github.com/rollup/rollup/pull/5596): Add originalFIleName property to emitted assets (@lukastaegert)
- [#5599](https://github.com/rollup/rollup/pull/5599): chore(deps): update dependency eslint-plugin-unicorn to v55 (@renovate[bot], @lukastaegert)
- [#5600](https://github.com/rollup/rollup/pull/5600): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)

## 4.19.2

_2024-08-01_

### Bug Fixes

- Avoid "cannot get value of null" error when using optional chaining with namespaces (#5597)

### Pull Requests

- [#5597](https://github.com/rollup/rollup/pull/5597): Fix retrieval of literal values for chained namespaces (@lukastaegert)

## 4.19.1

_2024-07-27_

### Bug Fixes

- Do not remove parantheses when tree-shaking logical expressions (#5584)
- Do not ignore side effects in calls left of an optional chaining operator (#5589)

### Pull Requests

- [#5584](https://github.com/rollup/rollup/pull/5584): fix: find whitespace from operator position to start (@TrickyPi)
- [#5587](https://github.com/rollup/rollup/pull/5587): docs: improve command by code-group (@thinkasany, @lukastaegert)
- [#5589](https://github.com/rollup/rollup/pull/5589): Fix side effect detection in optional chains (@lukastaegert)
- [#5592](https://github.com/rollup/rollup/pull/5592): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5593](https://github.com/rollup/rollup/pull/5593): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5594](https://github.com/rollup/rollup/pull/5594): chore(deps): lock file maintenance (@renovate[bot])
- [#5595](https://github.com/rollup/rollup/pull/5595): chore(deps): lock file maintenance (@renovate[bot])

## 4.19.0

_2024-07-20_

### Features

- Implement support for decorators (#5562)

### Bug Fixes

- Improve soucemap generation when tree-shaking logical expressions (#5581)

### Pull Requests

- [#5562](https://github.com/rollup/rollup/pull/5562): feat: implementing decorator support (@TrickyPi, @lukastaegert)
- [#5570](https://github.com/rollup/rollup/pull/5570): refactor(finalisers): condition branch (@Simon-He95, @zhangmo8)
- [#5572](https://github.com/rollup/rollup/pull/5572): Improve chunk and asset type information in docs (@lukastaegert)
- [#5573](https://github.com/rollup/rollup/pull/5573): Switch to audit resolver to ignore requirejs vulnerability (@lukastaegert)
- [#5575](https://github.com/rollup/rollup/pull/5575): chore(deps): update dependency inquirer to v10 (@renovate[bot], @lukastaegert)
- [#5576](https://github.com/rollup/rollup/pull/5576): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5580](https://github.com/rollup/rollup/pull/5580): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5581](https://github.com/rollup/rollup/pull/5581): When tree-shaking logical expression, make sure to remove all trailing white-space. (@lukastaegert)

## 4.18.1

_2024-07-08_

### Bug Fixes

- Prevent "%" in generated file names to ensure imports resolve (#5535)

### Pull Requests

- [#5524](https://github.com/rollup/rollup/pull/5524): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5525](https://github.com/rollup/rollup/pull/5525): chore(deps): lock file maintenance (@renovate[bot])
- [#5526](https://github.com/rollup/rollup/pull/5526): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5527](https://github.com/rollup/rollup/pull/5527): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5529](https://github.com/rollup/rollup/pull/5529): Use Spanned trait to simplify logic (@lukastaegert)
- [#5530](https://github.com/rollup/rollup/pull/5530): Fix typos in ARCHITECTURE.md (@younggglcy)
- [#5532](https://github.com/rollup/rollup/pull/5532): Use Rust macros for converters where possible (@lukastaegert)
- [#5535](https://github.com/rollup/rollup/pull/5535): fix: escape `%` if URI malformed (@baseballyama, @lukastaegert)
- [#5536](https://github.com/rollup/rollup/pull/5536): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5541](https://github.com/rollup/rollup/pull/5541): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5542](https://github.com/rollup/rollup/pull/5542): chore(deps): lock file maintenance (@renovate[bot])
- [#5543](https://github.com/rollup/rollup/pull/5543): Watch rust files and rebuild during dev (@lukastaegert)
- [#5544](https://github.com/rollup/rollup/pull/5544): Refactor AST converters (@lukastaegert)
- [#5545](https://github.com/rollup/rollup/pull/5545): chore(deps): update dependency @rollup/plugin-commonjs to v26 (@renovate[bot])
- [#5546](https://github.com/rollup/rollup/pull/5546): chore(deps): update dependency nyc to v17 (@renovate[bot])
- [#5547](https://github.com/rollup/rollup/pull/5547): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5548](https://github.com/rollup/rollup/pull/5548): chore(deps): lock file maintenance (@renovate[bot])
- [#5549](https://github.com/rollup/rollup/pull/5549): chore(deps): lock file maintenance (@renovate[bot])
- [#5550](https://github.com/rollup/rollup/pull/5550): chore(deps): update dependency eslint-plugin-unicorn to v54 (@renovate[bot], @lukastaegert)
- [#5551](https://github.com/rollup/rollup/pull/5551): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5555](https://github.com/rollup/rollup/pull/5555): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5556](https://github.com/rollup/rollup/pull/5556): chore(deps): lock file maintenance (@renovate[bot])
- [#5558](https://github.com/rollup/rollup/pull/5558): Consider that the body of ClassBody might be of type StaticBlock (@TrickyPi)
- [#5565](https://github.com/rollup/rollup/pull/5565): refactor(ast): conditional branch (@Simon-He95)
- [#5566](https://github.com/rollup/rollup/pull/5566): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5567](https://github.com/rollup/rollup/pull/5567): chore(deps): lock file maintenance (@renovate[bot])

## 4.18.0

_2024-05-22_

### Features

- Resolve import.meta.filename and .dirname in transpiled plugins (#5520)

### Pull Requests

- [#5504](https://github.com/rollup/rollup/pull/5504): Auto generate node index (@lukastaegert)
- [#5507](https://github.com/rollup/rollup/pull/5507): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5508](https://github.com/rollup/rollup/pull/5508): chore(deps): lock file maintenance (@renovate[bot])
- [#5510](https://github.com/rollup/rollup/pull/5510): Split up converter.rs into AST nodes (@lukastaegert)
- [#5512](https://github.com/rollup/rollup/pull/5512): chore(deps): update dependency builtin-modules to v4 (@renovate[bot], @lukastaegert)
- [#5514](https://github.com/rollup/rollup/pull/5514): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5518](https://github.com/rollup/rollup/pull/5518): chore(deps): update dependency eslint-plugin-unicorn to v53 (@renovate[bot], @lukastaegert)
- [#5519](https://github.com/rollup/rollup/pull/5519): chore(deps): lock file maintenance minor/patch updates (@renovate[bot], @lukastaegert)
- [#5520](https://github.com/rollup/rollup/pull/5520): Resolve import.meta.{filename,dirname} in files imported from config (@BPScott)
- [#5521](https://github.com/rollup/rollup/pull/5521): docs: correct base32 to base36 in documentation (@highcastlee)

## 4.17.2

_2024-04-30_

### Bug Fixes

- Fix tree-shaking problems when using spread arguments (#5503)

### Pull Requests

- [#5501](https://github.com/rollup/rollup/pull/5501): Slightly improve perf report (@lukastaegert)
- [#5503](https://github.com/rollup/rollup/pull/5503): fix: rest element should deoptimize parameter values (@liuly0322)

## 4.17.1

_2024-04-29_

### Bug Fixes

- Prevent infinite recursions for certain constructor invocations (#5500)

### Pull Requests

- [#5500](https://github.com/rollup/rollup/pull/5500): fix: parameter variable infinite recursion error (@liuly0322)

## 4.17.0

_2024-04-27_

### Features

- Track function call arguments to optimize functions only called once or with the same literal values (re-release from 4.16.0) (#5483)

### Bug Fixes

- Reduce browser WASM size to a fraction by changing optimization settings (#5494)

### Pull Requests

- [#5483](https://github.com/rollup/rollup/pull/5483): feature(fix): function parameter tracking (@liuly0322)
- [#5488](https://github.com/rollup/rollup/pull/5488): Report performance in CI (@TrickyPi)
- [#5489](https://github.com/rollup/rollup/pull/5489): Create FUNDING.json (@BenJam)
- [#5492](https://github.com/rollup/rollup/pull/5492): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5493](https://github.com/rollup/rollup/pull/5493): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5494](https://github.com/rollup/rollup/pull/5494): Use opt-level=z for browser wasm (@sapphi-red)

## 4.16.4

_2024-04-23_

### Bug Fixes

- Revert function parameter tracking logic introduced in 4.16.0 to work on some remaining issues (#5487)

### Pull Requests

- [#5487](https://github.com/rollup/rollup/pull/5487): Revert function parameter tracking logic for now (@lukastaegert)

## 4.16.3

_2024-04-23_

### Bug Fixes

- Do not optimize IIFEs that have a name and are again referenced inside their definition (#5486)

### Pull Requests

- [#5486](https://github.com/rollup/rollup/pull/5486): fix: only optimize annoymous iife (@liuly0322)

## 4.16.2

_2024-04-22_

### Bug Fixes

- Resolve a situation condition where reassignments of function parameters were not tracked properly (#5482)
- Make sure that for armv7 packages, only one package is downloaded for the user (musl or gnu) (#5479)

### Pull Requests

- [#5479](https://github.com/rollup/rollup/pull/5479): Add libc field to armv7 packages (@sapphi-red)
- [#5482](https://github.com/rollup/rollup/pull/5482): fix: function parameter reassigned update (@liuly0322)

## 4.16.1

_2024-04-21_

### Bug Fixes

- Fix crash when rendering logical or conditional expressions (#5481)

### Pull Requests

- [#5481](https://github.com/rollup/rollup/pull/5481): fix: conditional/logical expression should request a new tree-shaking (@liuly0322)

## 4.16.0

_2024-04-21_

### Features

- Track function call arguments to optimize functions only called once or with the same literal values (#5443)

### Pull Requests

- [#5443](https://github.com/rollup/rollup/pull/5443): feat: improve tree-shaking by propagate const parameter (@liuly0322, @lukastaegert)

## 4.15.0

_2024-04-20_

### Features

- Add output.importAttributesKey option to select whether to use "with" or "assert" for import attributes (#5474)

### Pull Requests

- [#5474](https://github.com/rollup/rollup/pull/5474): Add ImportAttributesKey to choose keyword ("with" | "assert") (@doubleaa93, @lukastaegert)
- [#5475](https://github.com/rollup/rollup/pull/5475): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5477](https://github.com/rollup/rollup/pull/5477): Try to run emulated smoke tests for Linux environments (@lukastaegert)

## 4.14.3

_2024-04-15_

### Bug Fixes

- Support Alpine Linux and other MUSL builds on ARM (#5471)

### Pull Requests

- [#5471](https://github.com/rollup/rollup/pull/5471): Add linux arm musl build (@sapphi-red)

## 4.14.2

_2024-04-12_

### Bug Fixes

- Do not create invalid code when reexporting both a namespace and the default export from that namespace (#5466)
- Ensure ppc64 platform is properly detected (#5460)

### Pull Requests

- [#5456](https://github.com/rollup/rollup/pull/5456): Add high-level architecture documentation (@lukastaegert)
- [#5460](https://github.com/rollup/rollup/pull/5460): Fix ppc64le target (@lukastaegert)
- [#5463](https://github.com/rollup/rollup/pull/5463): chore: tweak the comment about files should not be edited (@TrickyPi)
- [#5466](https://github.com/rollup/rollup/pull/5466): Ensure reexported namespaces do not prevent creation of default export helpers (@lukastaegert)
- [#5468](https://github.com/rollup/rollup/pull/5468): chore(deps): update dependency eslint-plugin-unicorn to v52 (@renovate[bot], @lukastaegert)
- [#5469](https://github.com/rollup/rollup/pull/5469): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5470](https://github.com/rollup/rollup/pull/5470): chore(deps): lock file maintenance (@renovate[bot])

## 4.14.1

_2024-04-07_

### Bug Fixes

- Show better error when running on musl Linux where the musl build is not supported (#5454)

### Pull Requests

- [#5451](https://github.com/rollup/rollup/pull/5451): chore: generate string constants from config (@TrickyPi)
- [#5452](https://github.com/rollup/rollup/pull/5452): chore(deps): lock file maintenance minor/patch updates (@renovate[bot])
- [#5453](https://github.com/rollup/rollup/pull/5453): chore(deps): lock file maintenance (@renovate[bot])
- [#5454](https://github.com/rollup/rollup/pull/5454): Improve error message when running on unsupported MUSL Linux (@lukastaegert)
- [#5455](https://github.com/rollup/rollup/pull/5455): Remove inlining logic in AST (de-)serializer (@lukastaegert)

## 4.14.0

_2024-04-03_

### Features

- Display error causes in Rollup CLI (#5422)
- Add basic support for explicit resource management via "using" and "await using" (#5423)

### Pull Requests

- [#5422](https://github.com/rollup/rollup/pull/5422): feat: show all cause in Error (@devohda, @lukastaegert)
- [#5444](https://github.com/rollup/rollup/pull/5444): feat: support explicit-resource-management (@TrickyPi)
- [#5445](https://github.com/rollup/rollup/pull/5445): docs: add `@shikiji/vitepress-twoslash` (@sapphi-red)
- [#5447](https://github.com/rollup/rollup/pull/5447): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5448](https://github.com/rollup/rollup/pull/5448): chore(deps): lock file maintenance (@renovate[bot])

## 4.13.2

_2024-03-28_

### Bug Fixes

- Ensure accessing module info is cached after the build phase for improved performance (#5438)
- Support powerpc64le CPUs (#5350)

### Pull Requests

- [#5350](https://github.com/rollup/rollup/pull/5350): Add support for ppc64le (@pavolloffay, @lukastaegert)
- [#5438](https://github.com/rollup/rollup/pull/5438): Cache module info getters before output generation (@bluwy, @lukastaegert)

## 4.13.1

_2024-03-27_

### Bug Fixes

- Add new linux-s390x-gnu native binary package (#5346)

### Pull Requests

- [#5346](https://github.com/rollup/rollup/pull/5346): Add support for linux s390x gnu (@edlerd)
- [#5430](https://github.com/rollup/rollup/pull/5430): chore(deps): update dependency @vue/eslint-config-typescript to v13 (@renovate[bot], @lukastaegert)
- [#5431](https://github.com/rollup/rollup/pull/5431): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5432](https://github.com/rollup/rollup/pull/5432): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5436](https://github.com/rollup/rollup/pull/5436): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5437](https://github.com/rollup/rollup/pull/5437): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.13.0

_2024-03-12_

### Features

- Ensure that the location of parse errors and other logs is encoded in the error message as well (#5424)

### Pull Requests

- [#5417](https://github.com/rollup/rollup/pull/5417): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5418](https://github.com/rollup/rollup/pull/5418): chore(deps): lock file maintenance (@renovate[bot])
- [#5419](https://github.com/rollup/rollup/pull/5419): chore: fix typo (@OnlyWick)
- [#5424](https://github.com/rollup/rollup/pull/5424): Add locations to logs, warnings and error messages ( @lukastaegert)

## 4.12.1

_2024-03-06_

### Bug Fixes

- Escape special characters in file references (#5404)

### Pull Requests

- [#5398](https://github.com/rollup/rollup/pull/5398): Rename `getRollupEror` to `getRollupError` (@MrRefactoring)
- [#5399](https://github.com/rollup/rollup/pull/5399): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5404](https://github.com/rollup/rollup/pull/5404): fix: escape ids in `import.meta.ROLLUP_FILE_URL_referenceId` correctly (@sapphi-red)
- [#5406](https://github.com/rollup/rollup/pull/5406): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5407](https://github.com/rollup/rollup/pull/5407): chore(deps): lock file maintenance (@renovate[bot])
- [#5411](https://github.com/rollup/rollup/pull/5411): Chunk assignment - Fix comment line breaks and typo (@yoavweiss, @lukastaegert)

## 4.12.0

_2024-02-16_

### Features

- Improve raw bundling performance by 10-15% when not using the cache or plugins that return an AST (#5391)

### Pull Requests

- [#5391](https://github.com/rollup/rollup/pull/5391): Improve performance by directly constructing AST from buffer ( @lukastaegert)
- [#5393](https://github.com/rollup/rollup/pull/5393): chore(deps): update dependency eslint-plugin-unicorn to v51 ( @renovate[bot])
- [#5394](https://github.com/rollup/rollup/pull/5394): chore(deps): update typescript-eslint monorepo to v7 (major) ( @renovate[bot])
- [#5395](https://github.com/rollup/rollup/pull/5395): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.11.0

_2024-02-15_

### Features

- Add `output.reexportProtoFromExternal` option to disable special code for handling `__proto__` reexports (#5380)

### Bug Fixes

- Ensure namespace reexport code can be parsed by cjs-module-lexer (#5380)
- Throw when trying to reassing `const` variables (#5388)

### Pull Requests

- [#5380](https://github.com/rollup/rollup/pull/5380): fix: separately export `__proto__` for compatibility with CJS Transpiler Re-exports (@TrickyPi)
- [#5388](https://github.com/rollup/rollup/pull/5388): Add const reassign rule (@TrickyPi)

## 4.10.0

_2024-02-10_

### Features

- Support base-36 and base-16 hashes again via new `output.hashCharacters` option (#5371)

### Bug Fixes

- Do not crash process for panics in native code but throw them as JavaScript errors (#5383)

### Pull Requests

- [#5359](https://github.com/rollup/rollup/pull/5359): chore(deps): update actions/cache action to v4 (@renovate[bot])
- [#5360](https://github.com/rollup/rollup/pull/5360): chore(deps): update dependency pretty-ms to v9 (@renovate[bot])
- [#5366](https://github.com/rollup/rollup/pull/5366): chore(deps): update dependency husky to v9 (@renovate[bot])
- [#5367](https://github.com/rollup/rollup/pull/5367): chore(deps): update peter-evans/create-or-update-comment action to v4 (@renovate[bot])
- [#5368](https://github.com/rollup/rollup/pull/5368): chore(deps): update peter-evans/find-comment action to v3 ( @renovate[bot])
- [#5369](https://github.com/rollup/rollup/pull/5369): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5370](https://github.com/rollup/rollup/pull/5370): Fix dependency range for Node types (@lukastaegert)
- [#5371](https://github.com/rollup/rollup/pull/5371): Implement "output.hashCharacters" option to define character set for file hashes (@lukastaegert)
- [#5372](https://github.com/rollup/rollup/pull/5372): Roll back vitepress as 1.0.0-rc.40 breaks the development build ( @lukastaegert)
- [#5382](https://github.com/rollup/rollup/pull/5382): Update documentation (@TrickyPi)
- [#5383](https://github.com/rollup/rollup/pull/5383): Catch Rust panics and then throw them in JS (@TrickyPi)
- [#5384](https://github.com/rollup/rollup/pull/5384): chore(deps): update codecov/codecov-action action to v4 ( @renovate[bot])
- [#5385](https://github.com/rollup/rollup/pull/5385): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5386](https://github.com/rollup/rollup/pull/5386): Resolve all rollup imports to node_modules to avoid type conflict (@TrickyPi)

## 4.9.6

_2024-01-21_

### Bug Fixes

- Detect side effects when an element that was pushed into an array is modified via the array (#5352)

### Pull Requests

- [#5337](https://github.com/rollup/rollup/pull/5337): Generate AST transformers from config (@lukastaegert)
- [#5340](https://github.com/rollup/rollup/pull/5340): Also type-check d.ts files (@lukastaegert)
- [#5348](https://github.com/rollup/rollup/pull/5348): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5351](https://github.com/rollup/rollup/pull/5351): chore(deps): update dependency vite to v5.0.12 [security] ( @renovate[bot])
- [#5352](https://github.com/rollup/rollup/pull/5352): Track mutations of elements pushed into arrays (@lukastaegert)

## 4.9.5

_2024-01-12_

### Bug Fixes

- Fix issue where on Windows, Rollup would not load due to problems with the MSVC executable (#5335)

### Pull Requests

- [#5334](https://github.com/rollup/rollup/pull/5334): Fix typo in commondir.ts (@akiomik)
- [#5335](https://github.com/rollup/rollup/pull/5335): build: static link msvc runtime on Windows x64 platform ( @Brooooooklyn)
- [#5338](https://github.com/rollup/rollup/pull/5338): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.9.4

_2024-01-06_

### Bug Fixes

- Use quotes for keys in namespaces that are only numbers but are not valid integers (#5328)
- Allow to have comments between pure annotations and the annoted node (#5332)

### Pull Requests

- [#5328](https://github.com/rollup/rollup/pull/5328): Correctly handling number key (@LongTengDao)
- [#5332](https://github.com/rollup/rollup/pull/5332): Handle pure annotations that are separated by a comment ( @lukastaegert)

## 4.9.3

_2024-01-05_

### Bug Fixes

- Support `__proto__` as export/import name (#5313)
- Use ESTree AST type over custom type in user-facing types (#5323)

### Pull Requests

- [#5313](https://github.com/rollup/rollup/pull/5313): Correctly handling **proto** export as module object key ( @LongTengDao)
- [#5323](https://github.com/rollup/rollup/pull/5323): fix: Add estree.Program type to rollup.d.ts (@TrickyPi)
- [#5326](https://github.com/rollup/rollup/pull/5326): docs: fix grammar (@gigabites19)
- [#5329](https://github.com/rollup/rollup/pull/5329): chore(deps): update dependency @vue/eslint-config-prettier to v9 (@renovate[bot])
- [#5330](https://github.com/rollup/rollup/pull/5330): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.9.2

_2023-12-30_

### Bug Fixes

- Extend support for arbitrary namespace identifiers in SystemJS (#5321)
- Do not wrongly flag functions without side effects as side effects if moduleSideEffects is false (#5322)

### Pull Requests

- [#5305](https://github.com/rollup/rollup/pull/5305): Add JSDoc types to internal scripts (@lukastaegert)
- [#5309](https://github.com/rollup/rollup/pull/5309): chore(deps): update actions/download-artifact action to v4 ( @renovate[bot])
- [#5311](https://github.com/rollup/rollup/pull/5311): chode: add node badge (@btea)
- [#5312](https://github.com/rollup/rollup/pull/5312): Remove rollup-plugin-thatworks from devDeps (@TrickyPi)
- [#5318](https://github.com/rollup/rollup/pull/5318): chore(deps): update dependency eslint-plugin-unicorn to v50 ( @renovate[bot])
- [#5319](https://github.com/rollup/rollup/pull/5319): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5321](https://github.com/rollup/rollup/pull/5321): Handle arbitrary namespace identifiers in some SystemJS scenarios (@lukastaegert)
- [#5322](https://github.com/rollup/rollup/pull/5322): Do not handle declarations in modules without side effects as TDZ (@lukastaegert)

## 4.9.1

_2023-12-17_

### Bug Fixes

- Fix an issue where break statements could include the wrong label (#5297)

### Pull Requests

- [#5297](https://github.com/rollup/rollup/pull/5297): fix: use a new includedLabels in the body of the LabeledStatement (@TrickyPi)
- [#5300](https://github.com/rollup/rollup/pull/5300): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.9.0

_2023-12-13_

### Features

- Fully support arbitrary strings as import and export identifiers (#5298)

### Pull Requests

- [#5296](https://github.com/rollup/rollup/pull/5296): Do not assume setTimeout return type (@kapouer)
- [#5298](https://github.com/rollup/rollup/pull/5298): Fully support arbitrary module namespace identifiers for all formats (@lukastaegert)

## 4.8.0

_2023-12-11_

### Features

- Improve `experimentalMinChunkSize` to take already loaded modules from dynamic imports into account (#5294)

### Pull Requests

- [#5294](https://github.com/rollup/rollup/pull/5294): Find more merge targets for experimentalMinChunkSize ( @lukastaegert)

## 4.7.0

_2023-12-08_

### Features

- Add build for Linux riscv64 architecture (#5288)

### Bug Fixes

- Improve error message when native Windows build does not start (#5284)

### Pull Requests

- [#5278](https://github.com/rollup/rollup/pull/5278): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5281](https://github.com/rollup/rollup/pull/5281): Add logs and experimentalLogSideEffects to REPL (@lukastaegert)
- [#5284](https://github.com/rollup/rollup/pull/5284): Add friendly error for missing MSVC redistributable (@sapphi-red)
- [#5285](https://github.com/rollup/rollup/pull/5285): chore(deps): update dependency vite to v5.0.5 [security] ( @renovate[bot])
- [#5288](https://github.com/rollup/rollup/pull/5288): Add support for linux riscv64 gnu (@kxxt)
- [#5290](https://github.com/rollup/rollup/pull/5290): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.6.1

_2023-11-30_

### Bug Fixes

- Resolve a situation where declaring the same `var` several times was considered a conflict (#5276)

### Pull Requests

- [#5275](https://github.com/rollup/rollup/pull/5275): Add TNG as special sponsor (@lukastaegert)
- [#5276](https://github.com/rollup/rollup/pull/5276): Allow to redeclare parameters multiple times in nested scopes ( @lukastaegert)

## 4.6.0

_2023-11-26_

### Features

- Allow `this.addWatchFile` in all plugin hooks (#5270)

### Bug Fixes

- Show helpful error when native binaries are not installed due to an `npm` issue (#5267)
- Do not access `this` context in `this.addWatchFile` so it does not need to be bound when passed around (#5270)

### Pull Requests

- [#5267](https://github.com/rollup/rollup/pull/5267): Add friendly error for npm bug (@sapphi-red)
- [#5270](https://github.com/rollup/rollup/pull/5270): Allow this.addWatchFile in all hooks (@lukastaegert)
- [#5272](https://github.com/rollup/rollup/pull/5272): Debug deployed graphs (@lukastaegert)

## 4.5.2

_2023-11-24_

### Bug Fixes

- Handle files with UTF-8 BOM when using the commonjs plugin (#5268)

### Pull Requests

- [#5268](https://github.com/rollup/rollup/pull/5268): fix: strip BOM before calling transform hook (@TrickyPi)
- [#5269](https://github.com/rollup/rollup/pull/5269): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.5.1

_2023-11-21_

### Bug Fixes

- Do not error when a function expression uses the same name for a parameter and its id (#5262)

### Pull Requests

- [#5257](https://github.com/rollup/rollup/pull/5257): Fix graphs in docs, improve REPL colors (@lukastaegert)
- [#5262](https://github.com/rollup/rollup/pull/5262): Allow function expression parameters to shadow the function id ( @lukastaegert)

## 4.5.0

_2023-11-18_

### Bug Fixes

- Show a proper error when using native Rollup on armv7 musl Linux (#5255)

### Pull Requests

- [#5251](https://github.com/rollup/rollup/pull/5251): doc fix import assertions to attributes in API plugin development page (@lhapaipai)
- [#5253](https://github.com/rollup/rollup/pull/5253): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5255](https://github.com/rollup/rollup/pull/5255): Error for armv7 musl build (@lukastaegert)

## 4.4.1

_2023-11-14_

### Bug Fixes

- Do not flag duplicate function declarations in function scopes as syntax errors (#5248)

### Pull Requests

- [#5248](https://github.com/rollup/rollup/pull/5248): Allow functions to redeclare vars and functions in function scopes (@lukastaegert)

## 4.4.0

_2023-11-12_

### Features

- Replace SWC linting with faster internal linting to error on duplicate declarations etc. (#5207)

### Bug Fixes

- Show proper error when an entry exports non-existing bindings (#5207)

### Pull Requests

- [#5207](https://github.com/rollup/rollup/pull/5207): perf: run lint while constructing nodes (@sapphi-red)

## 4.3.1

_2023-11-11_

### Bug Fixes

- Fix rename error when handling errors in watch mode (#5240)
- Prevent warning when using `--forceExit` (#5245)

### Pull Requests

- [#5240](https://github.com/rollup/rollup/pull/5240): fix: allow the name of Rollup Error to be modified (@TrickyPi)
- [#5243](https://github.com/rollup/rollup/pull/5243): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5245](https://github.com/rollup/rollup/pull/5245): Ensure --forceExit works without warning (@lukastaegert)

## 4.3.0

_2023-11-03_

### Features

- Add `forceExit` CLI flag for situations where the CLI does not exit gracefully (#5195)

### Bug Fixes

- Properly catch errors when removing a temporary config file fails (#5198)

### Pull Requests

- [#5195](https://github.com/rollup/rollup/pull/5195): Add `forceExit` CLI flag (@raphael-theriault-swi)
- [#5198](https://github.com/rollup/rollup/pull/5198): fix: prevent `ENOENT` error on temp config removal (@jzempel)
- [#5237](https://github.com/rollup/rollup/pull/5237): chore: remove unused files and deps (@TrickyPi)
- [#5238](https://github.com/rollup/rollup/pull/5238): chore(deps): update dependency eslint-plugin-unicorn to v49 ( @renovate[bot])
- [#5239](https://github.com/rollup/rollup/pull/5239): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.2.0

_2023-10-31_

### Features

- Run parsing in multiple threads and introduce `parseAstAsync` helper function (#5202)

### Pull Requests

- [#5202](https://github.com/rollup/rollup/pull/5202): perf: introduce `parseAstAsync` and parallelize parsing AST ( @sapphi-red)

## 4.1.6

_2023-10-31_

### Bug Fixes

- Fix a bug where emtpy block comments in certain positions could freeze Rollup (#5231)

### Pull Requests

- [#5228](https://github.com/rollup/rollup/pull/5228): build: ensure rust toolchain components for linting are installed (@jerome-benoit)
- [#5231](https://github.com/rollup/rollup/pull/5231): Render emtpy block comments after tree-shaken statements ( @lukastaegert)
- [#5232](https://github.com/rollup/rollup/pull/5232): Revert specifying rustfmt and clippy in toolchain file as it breaks REPL build (@lukastaegert)

## 4.1.5

_2023-10-28_

### Bug Fixes

- Fix an issue where actual entries that were also implicit entries could remain implicit (#5220)

### Pull Requests

- [#5209](https://github.com/rollup/rollup/pull/5209): Document Vite workaround for browser build (@curran)
- [#5215](https://github.com/rollup/rollup/pull/5215): chore(deps): update dependency lint-staged to v15 ( @renovate[bot])
- [#5216](https://github.com/rollup/rollup/pull/5216): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5218](https://github.com/rollup/rollup/pull/5218): Update license plugin (@lukastaegert)
- [#5219](https://github.com/rollup/rollup/pull/5219): Fix error highlight in REPL (@lukastaegert)
- [#5220](https://github.com/rollup/rollup/pull/5220): Fix race condition when emitting implicitly dependent entries ( @lukastaegert)
- [#5224](https://github.com/rollup/rollup/pull/5224): chore(deps): update actions/setup-node action to v4 ( @renovate[bot])
- [#5225](https://github.com/rollup/rollup/pull/5225): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.1.4

_2023-10-16_

### Bug Fixes

- Reduce sizes @rollup/browser and @rollup/wasm-node WASM artifacts (#5204)

### Pull Requests

- [#5204](https://github.com/rollup/rollup/pull/5204): perf: shrink wasm size by avoid importing browserslist ( @sapphi-red)

## 4.1.3

_2023-10-15_

### Bug Fixes

- Fix WASM build as hash function was not exported (#5203)

### Pull Requests

- [#5203](https://github.com/rollup/rollup/pull/5203): fix: export xxhashBase64Url from wasm (@sapphi-red)

## 4.1.2

_2023-10-15_

_Release did not finish successfully_

## 4.1.1

_2023-10-15_

### Bug Fixes

- Improve Node parsing performance (#5201)

### Pull Requests

- [#5201](https://github.com/rollup/rollup/pull/5201): perf: use mimalloc for bindings_napi (@sapphi-red)

## 4.1.0

_2023-10-14_

### Features

- Reduce memory usage of Rollup builds (#5133)

### Pull Requests

- [#5133](https://github.com/rollup/rollup/pull/5133): perf: reducing ast node memory overhead (@thebanjomatic)
- [#5177](https://github.com/rollup/rollup/pull/5177): chore: explicitly set rust toolchain channel (@cijiugechu)
- [#5179](https://github.com/rollup/rollup/pull/5179): Update migration guide for Rollup 4 (@lukastaegert)
- [#5180](https://github.com/rollup/rollup/pull/5180): Resolve clippy errors (@cijiugechu)
- [#5183](https://github.com/rollup/rollup/pull/5183): Add clippy to pipeline and fix remaining issues (@lukastaegert)
- [#5184](https://github.com/rollup/rollup/pull/5184): docs: fix code example for `onLog` (@tjenkinson)
- [#5186](https://github.com/rollup/rollup/pull/5186): Improve wording for native artifacts in migration guide ( @lukastaegert)
- [#5190](https://github.com/rollup/rollup/pull/5190): test: add verifyAst type (@TrickyPi)
- [#5196](https://github.com/rollup/rollup/pull/5196): chore(deps): update dependency rollup to v4 (@renovate[bot])
- [#5197](https://github.com/rollup/rollup/pull/5197): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 4.0.2

_2023-10-06_

### Bug Fixes

- Fix annotation detection logic to not fail when a non-ASCII character precedes a double underscore (#5178)

### Pull Requests

- [#5178](https://github.com/rollup/rollup/pull/5178): Handle special characters before double underscores ( @lukastaegert)

## 4.0.1

_2023-10-06_

### Bug Fixes

- Do not panic on trailing semicolons after class methods (#5173)
- Add artifact for arm64 linux musl target (#5176)

### Pull Requests

- [#5172](https://github.com/rollup/rollup/pull/5172): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5173](https://github.com/rollup/rollup/pull/5173): fix: ignores empty statements in class body that is returned by SWC parser (@TrickyPi)
- [#5176](https://github.com/rollup/rollup/pull/5176): Fix linux arm musl build (@lukastaegert)

## 4.0.0

_2023-10-05_

### BREAKING CHANGES

#### General Changes

- The minimal required Node version is now 18.0.0 (#5142)
- The browser build now relies on a WASM artifact that needs to be provided as well (#5073)
- The NodeJS build now relies on an optional native binary; for unsupported platforms, users can use the `@rollup/wasm-node` package that has the same interface as Rollup but relies on WASM artifacts (#5073)
- The `INVALID_IMPORT_ASSERTION` error code has been replaced with `INVALID_IMPORT_ATTRIBUTE` (#5073)
- Rollup will now warn for `@__PURE__` and `@__NO_SIDE_EFFECTS__` annotations in invalid locations (#5165)
- If an entry module starts with a shebang comment `#!...`, this comment will be prepended to the output for `es` and `cjs` formats (#5163)
- File hashes will now use url-safe base64 encoded hashes (#5155)
- The maximum hash length has been reduced to 22 characters (#5155)
- The `RollupWarning` type has been removed in favor of the `RollupLog` type (#5147)

#### Changes to Rollup Options

- Acorn plugins are no longer supported, the `acornInjectPlugins` option has been removed (#5073)
- The `acorn` option has been removed (#5073)
- `output.externalImportAssertions` has been deprecated in favor of `output.externalImportAttributes` (#5073)
- `inlineDynamicImports`, `manualChunks` and `preserveModules` have been removed on input option level: Please use the corresponding output options of the same names (#5143)
- Removed output options (#5143):
  - `output.experimentalDeepDynamicChunkOptimization`: This option is no longer needed as Rollup now always runs the full chunking algorithm
  - `output.dynamicImportFunction`: Use the `renderDynamicImport` plugin hook instead
  - `output.namespaceToStringTag`: Use `output.generatedCode.symbols` instead
  - `output.preferConst`: Use `output.generatedCode.constBindings` instead

#### Plugin API Changes

- For `this.resolve`, the default of the `skipSelf` option is now `true` (#5142)
- `this.parse` now only supports the `allowReturnOutsideFunction` option for now (#5073)
- Import assertions now use the [new import attribute AST structure](https://github.com/estree/estree/blob/master/experimental/import-attributes.md) ( #5073)
- "assertions" have been replaced with "attributes" in various places of the plugin interface (#5073)
- If the import of a module id is handled by the `load` hook of a plugin, `rollup.watch` no longer watches the actual file if the module id corresponds to a real path; if this is intended, then the plugin is responsible for calling `this.addWatchFile` for any dependency files (#5150)
- The normalized input options provided by `buildStart` and other hooks no longer contain an `onwarn` handler; plugins should use `onLog` instead (#5147)
- `this.moduleIds` has been removed from the plugin context: Use `this.getModuleIds()` instead (#5143)
- The `hasModuleSideEffects` flag has been removed from the `ModuleInfo` returned by `this.getModuleInfo()`: Use `moduleSideEffects` on the `ModuleInfo` instead (#5143)

### Features

- Improve parsing speed by switching to a native SWC-based parser (#5073)
- Rollup will now warn for `@__PURE__` and `@__NO_SIDE_EFFECTS__` annotations in invalid locations (#5165)
- The parser is now exposed as a separate export `parseAst` (#5169)

### Bug Fixes

- Rollup no longer tries to watch virtual files if their name corresponds to an actual file name; instead, plugins handle watching via `this.addWatchFile()` (#5150)

### Pull Requests

- [#5073](https://github.com/rollup/rollup/pull/5073): [v4.0] Switch parser to SWC and introduce native/WASM code ( @lukastaegert)
- [#5142](https://github.com/rollup/rollup/pull/5142): [v4.0] Set the default of skipSelf to true (@TrickyPi)
- [#5143](https://github.com/rollup/rollup/pull/5143): [v4.0] Remove deprecated features (@lukastaegert)
- [#5144](https://github.com/rollup/rollup/pull/5144): [v4.0] Imporve the performance of generating ast and rollup ast nodes (@TrickyPi)
- [#5147](https://github.com/rollup/rollup/pull/5147): [v4.0] Remove onwarn from normalized input options ( @lukastaegert)
- [#5150](https://github.com/rollup/rollup/pull/5150): [v4.0] feat: Do not watch files anymore if their content is returned by the load hook (@TrickyPi)
- [#5154](https://github.com/rollup/rollup/pull/5154): [v4.0] Add parse option to allow return outside function ( @lukastaegert)
- [#5155](https://github.com/rollup/rollup/pull/5155): [v4.0] feat: implement hashing content in Rust (@TrickyPi)
- [#5157](https://github.com/rollup/rollup/pull/5157): [v4.0] Handle empty exports (@lukastaegert)
- [#5160](https://github.com/rollup/rollup/pull/5160): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5163](https://github.com/rollup/rollup/pull/5163): [v4.0] feat: preserve shebang in entry module for CJS and ESM outputs (@TrickyPi)
- [#5164](https://github.com/rollup/rollup/pull/5164): [v4.0] fix: also strip BOM from code strings in JS (@TrickyPi)
- [#5165](https://github.com/rollup/rollup/pull/5165): [v4.0] warn for invalid annotations (@lukastaegert)
- [#5168](https://github.com/rollup/rollup/pull/5168): [v4.0] Ensure we support new import attribute "with" syntax ( @lukastaegert)
- [#5169](https://github.com/rollup/rollup/pull/5169): [v4.0] Expose parser (@lukastaegert)

For previous changelogs, see

- [Rollup 3.x](./CHANGELOG-3.md)
- [Rollup 2.x](./CHANGELOG-2.md)
- [Rollup 1.x](./CHANGELOG-1.md)
- [Rollup 0.x](./CHANGELOG-0.md)
