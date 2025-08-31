# rollup changelog

## 3.29.4

_2023-09-28_

### Bug Fixes

- Fix static analysis when an exported function uses callbacks (#5158)

### Pull Requests

- [#5158](https://github.com/rollup/rollup/pull/5158): Deoptimize all parameters when losing track of a function ( @lukastaegert)

## 3.29.3

_2023-09-24_

### Bug Fixes

- Fix a bug where code was wrongly tree-shaken after mutating function parameters (#5153)

### Pull Requests

- [#5145](https://github.com/rollup/rollup/pull/5145): docs: improve the docs repl appearance in the light mode ( @TrickyPi)
- [#5148](https://github.com/rollup/rollup/pull/5148): chore(deps): update dependency @vue/eslint-config-typescript to v12 (@renovate[bot])
- [#5149](https://github.com/rollup/rollup/pull/5149): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5153](https://github.com/rollup/rollup/pull/5153): Fully deoptimize first level path when deoptimizing nested parameter paths (@lukastaegert)

## 3.29.2

_2023-09-15_

### Bug Fixes

- Export `TreeshakingPreset` type (#5131)

### Pull Requests

- [#5131](https://github.com/rollup/rollup/pull/5131): fix: exports `TreeshakingPreset` (@moltar)
- [#5134](https://github.com/rollup/rollup/pull/5134): docs: steps to enable symlinks on windows (@thebanjomatic)
- [#5137](https://github.com/rollup/rollup/pull/5137): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 3.29.1

_2023-09-10_

### Bug Fixes

- Fix time measurement of plugin hooks in watch mode (#5114)
- Ensure accessing document.currentScript in import.meta.url returns correct results (#5118)

### Pull Requests

- [#5114](https://github.com/rollup/rollup/pull/5114): fix(perf): avoid superfluous timer wrappings in watch mode ( @ZhengLiu2825)
- [#5118](https://github.com/rollup/rollup/pull/5118): fix: access document.currentScript at the top level (@TrickyPi)
- [#5125](https://github.com/rollup/rollup/pull/5125): chore(deps): update actions/checkout action to v4 ( @renovate[bot])
- [#5126](https://github.com/rollup/rollup/pull/5126): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5129](https://github.com/rollup/rollup/pull/5129): re-enbale repl-artefacts workflow for rollup-swc branch ( @TrickyPi)

## 3.29.0

_2023-09-06_

### Features

- Add output.sourcemapFileNames option (#5105)
- Add generic type parameter for `api` to Plugin type (#5112)

### Bug Fixes

- Ensure mutations of CustomEvent details are tracked (#5123)

### Pull Requests

- [#5105](https://github.com/rollup/rollup/pull/5105): Added option to name sourcemap files, i.e. a output.sourcemapFileName… (@atti187)
- [#5108](https://github.com/rollup/rollup/pull/5108): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5109](https://github.com/rollup/rollup/pull/5109): Docs: load full path of rollup.browser.js for Rollup V4 ( @TrickyPi)
- [#5112](https://github.com/rollup/rollup/pull/5112): feat(types): add generic type for plugin api (@sxzz)
- [#5115](https://github.com/rollup/rollup/pull/5115): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5123](https://github.com/rollup/rollup/pull/5123): Deoptimize custom event detail (@lukastaegert)

## 3.28.1

_2023-08-22_

### Bug Fixes

- Ensure external files with relative import paths outside the target are rendered correctly (#5099)

### Pull Requests

- [#5093](https://github.com/rollup/rollup/pull/5093): chore(deps): update dependency eslint-config-prettier to v9 ( @renovate[bot])
- [#5094](https://github.com/rollup/rollup/pull/5094): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5099](https://github.com/rollup/rollup/pull/5099): Fix resolution of relative external files outside target directory (@lukastaegert)
- [#5101](https://github.com/rollup/rollup/pull/5101): chore(deps): update dependency lint-staged to v14 ( @renovate[bot])
- [#5102](https://github.com/rollup/rollup/pull/5102): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 3.28.0

_2023-08-09_

### Features

- Add a new property `preliminaryFileName` to generated chunks containing the file name placeholder (#5086)
- Improve performance of sourcemap generation by lazily decoding mappings (#5087)

### Bug Fixes

- Make the `code` property of rendered modules in the output readonly (#5091)

### Pull Requests

- [#5086](https://github.com/rollup/rollup/pull/5086): feat: add `preliminaryFileName` to `OutputChunk` (@lsdsjy)
- [#5087](https://github.com/rollup/rollup/pull/5087): perf(sourcemaps): add back lazy sourcemap decode and handling nullish mappings (@thebanjomatic)
- [#5091](https://github.com/rollup/rollup/pull/5091): fix: the type of RenderedModule.code is readonly (@TrickyPi)

## 3.27.2

_2023-08-04_

### Bug Fixes

- Revert sourcemap performance improvement for now as it causes issues with Vite (#5075)

### Pull Requests

- [#5075](https://github.com/rollup/rollup/pull/5075): Revert perf(sourcemap): lazy compute decoded mappings ( @thebanjomatic)

## 3.27.1

_2023-08-03_

### Bug Fixes

- Improve performance when generating sourcemaps (#5075)

### Pull Requests

- [#5075](https://github.com/rollup/rollup/pull/5075): perf(sourcemap): lazy compute decoded mappings (@thebanjomatic)

## 3.27.0

_2023-07-28_

### Features

- Mark `Object.values` and `Object.entries` as pure if their argument does not contain getters (#5072)

### Pull Requests

- [#5070](https://github.com/rollup/rollup/pull/5070): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5071](https://github.com/rollup/rollup/pull/5071): docs(tutorial): change the .js extension to .mjs (@TrickyPi)
- [#5072](https://github.com/rollup/rollup/pull/5072): Add known globals (@sapphi-red)
- [#5078](https://github.com/rollup/rollup/pull/5078): chore(deps): update dependency @vue/eslint-config-prettier to v8 (@renovate[bot])
- [#5079](https://github.com/rollup/rollup/pull/5079): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 3.26.3

_2023-07-17_

### Bug Fixes

- Do not pass external modules to `manualChunks` to avoid breaking existing configs (#5068)

### Pull Requests

- [#5056](https://github.com/rollup/rollup/pull/5056): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5059](https://github.com/rollup/rollup/pull/5059): chore(config): migrate renovate config (@renovate[bot])
- [#5064](https://github.com/rollup/rollup/pull/5064): chore(deps): update dependency prettier to v3 (@renovate[bot])
- [#5065](https://github.com/rollup/rollup/pull/5065): chore(deps): update typescript-eslint monorepo to v6 (major) ( @renovate[bot])
- [#5068](https://github.com/rollup/rollup/pull/5068): fix: don't pass external modules to the manualChunks function ( @TrickyPi)

## 3.26.2

_2023-07-06_

### Bug Fixes

- Improve error handling when manual chunks would contain external modules (#5050)

### Pull Requests

- [#5050](https://github.com/rollup/rollup/pull/5050): fix: improve error for manualChunks' modules that are resolved as an external module (@TrickyPi)

## 3.26.1

_2023-07-05_

### Bug Fixes

- Support `hasOwnProperty` as exported name in CommonJS (#5010)
- Properly reference browser types in package file (#5051)

### Pull Requests

- [#5010](https://github.com/rollup/rollup/pull/5010): safe hasOwnProperty call (@LongTengDao)
- [#5051](https://github.com/rollup/rollup/pull/5051): @rollup/browser: fix types export map entry (@developit)

## 3.26.0

_2023-06-30_

### Features

- Add `--filterLogs` CLI flag and `ROLLUP_FILTER_LOGS` environment variable for log filtering (#5035)

### Pull Requests

- [#5035](https://github.com/rollup/rollup/pull/5035): Add ability to filter logs via CLI option or environment variable (@lukastaegert)
- [#5049](https://github.com/rollup/rollup/pull/5049): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 3.25.3

_2023-06-26_

### Bug Fixes

- Fix error when inlining dynamic imports that contain unused reexported variables (#5047)

### Pull Requests

- [#5047](https://github.com/rollup/rollup/pull/5047): Do not add tree-shaken variables to namespaces when inlining dynamic imports (@lukastaegert)

## 3.25.2

_2023-06-24_

### Bug Fixes

- Handle plugin errors where `code` is not a string (#5042)
- Use current transformed source when generating code frames with positions in transform hooks (#5045)

### Pull Requests

- [#5038](https://github.com/rollup/rollup/pull/5038): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5040](https://github.com/rollup/rollup/pull/5040): Fix typo in index.md (@vHeemstra)
- [#5042](https://github.com/rollup/rollup/pull/5042): fix: a plugin error can contains numeric code (@TrickyPi)
- [#5045](https://github.com/rollup/rollup/pull/5045): Fix `this.error` with `pos` in `transform` hook (@sapphi-red)
- [#5046](https://github.com/rollup/rollup/pull/5046): chore(deps): update dependency locate-character to v3 ( @renovate[bot])

## 3.25.1

_2023-06-12_

### Bug Fixes

- Respect `__NO_SIDE_EFFECTS__` for async functions (#5031)

### Pull Requests

- [#5031](https://github.com/rollup/rollup/pull/5031): fix: `__NO_SIDE_EFFECTS__` annotation for async function (@antfu)

## 3.25.0

_2023-06-11_

### Features

- Add `this.info` and `this.debug` plugin context logging functions (#5026)
- Add `onLog` option to read, map and filter logs (#5026)
- Add `logLevel` option to fully suppress logs by level (#5026)
- Support function logs in `this.warn`, `this.info` and `this.debug` to avoid heavy computations based on log level ( #5026)
- Add `onLog` plugin hook to read, filter and map logs from plugins (#5026)

### Pull Requests

- [#5026](https://github.com/rollup/rollup/pull/5026): Add Logging API (@lukastaegert)

## 3.24.1

_2023-06-10_

### Bug Fixes

- Fix an issue where bundles with `@rollup/plugin-commonjs` were missing internal dependencies when code-splitting ( #5029)
- Do not use `process.exit(0)` in watch mode to avoid issues in embedded scenarios (#5027)

### Pull Requests

- [#5027](https://github.com/rollup/rollup/pull/5027): fix turborepo with rollup --watch (@plumber-dhaval)
- [#5028](https://github.com/rollup/rollup/pull/5028): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5029](https://github.com/rollup/rollup/pull/5029): fix: get right sideEffectModules (@TrickyPi)

## 3.24.0

_2023-06-07_

### Features

- Add new annotation `/* #__NO_SIDE_EFFECTS__ */` to mark function declarations as side effect free (#5024)

### Pull Requests

- [#5024](https://github.com/rollup/rollup/pull/5024): feat: support `#__NO_SIDE_EFFECTS__` annotation for function declaration (@antfu)

## 3.23.1

_2023-06-04_

### Bug Fixes

- Ensure the last segment of sourcemapBaseUrl is never omitted (#5022)

### Pull Requests

- [#5006](https://github.com/rollup/rollup/pull/5006): Better workflow caching (@lukastaegert)
- [#5012](https://github.com/rollup/rollup/pull/5012): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5022](https://github.com/rollup/rollup/pull/5022): fix: add a trailing slash automatically for sourcemapBaseUrl ( @TrickyPi)
- [#5023](https://github.com/rollup/rollup/pull/5023): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])

## 3.23.0

_2023-05-22_

### Features

- Support emitting "prebuilt chunks" from plugins (#4990)

### Bug Fixes

- Mark Sets and Maps as pure when they receive an array literal as argument (#5005)

### Pull Requests

- [#4990](https://github.com/rollup/rollup/pull/4990): feat: this.emitFile support prebuilt-chunk type (@TrickyPi)
- [#5005](https://github.com/rollup/rollup/pull/5005): feat: mark Set, Map, WeakSet and WeakMap with array arguments as pure (@TrickyPi)

## 3.22.1

_2023-05-21_

### Bug Fixes

- Remove force quit again as it caused some issues (#5004)

### Pull Requests

- [#5001](https://github.com/rollup/rollup/pull/5001): chore(deps): update dependency @rollup/plugin-commonjs to v25 ( @renovate[bot])
- [#5002](https://github.com/rollup/rollup/pull/5002): chore(deps): update dependency eslint-plugin-unicorn to v47 ( @renovate[bot])
- [#5003](https://github.com/rollup/rollup/pull/5003): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#5004](https://github.com/rollup/rollup/pull/5004): Do not force quit Rollup or close stdout (@lukastaegert)

## 3.22.0

_2023-05-17_

### Features

- Prevent empty non-facade chunks by merging them into other suitable chunks (#4989)
- Avoid facade chunks in some situations involving reexports (#4989)
- Improve algorithm for best merge target when using `experimentalMinChunkSize` to take tree-shaking into account ( #4989)

### Bug Fixes

- Take side effects of external dependencies into account when merging chunks for `experimentalMinChunkSize` (#4989)

### Pull Requests

- [#4989](https://github.com/rollup/rollup/pull/4989): Prevent empty chunks and thoroughly improve experimentalMinChunkSize (@lukastaegert)

## 3.21.8

_2023-05-16_

### Bug Fixes

- Allow a namespace to properly contain itself as a named export (#4991)

### Pull Requests

- [#4991](https://github.com/rollup/rollup/pull/4991): Handle self-referencing namespaces (@lukastaegert)

## 3.21.7

_2023-05-13_

### Bug Fixes

- Show correct error on uncaught exceptions in watch mode (#4987)

### Pull Requests

- [#4987](https://github.com/rollup/rollup/pull/4987): Properly quit on uncaught exceptions (@lukastaegert)
- [#4988](https://github.com/rollup/rollup/pull/4988): test: add options type for function tests (@TrickyPi)

## 3.21.6

_2023-05-09_

### Bug Fixes

- Ensure Rollup CLI prints everything to stdout before exiting (#4980)

### Pull Requests

- [#4980](https://github.com/rollup/rollup/pull/4980): chore(deps): lock file maintenance minor/patch updates ( @renovate[bot])
- [#4983](https://github.com/rollup/rollup/pull/4983): Prevent exit before stdout is drained (@lukastaegert)

## 3.21.5

_2023-05-05_

### Bug Fixes

- Keep all consecutive lines at the top of each module that start with a comment (#4975)
- Ensure that declarations inside switch cases do not use the same scope as the discriminator (#4979)

### Pull Requests

- [#4975](https://github.com/rollup/rollup/pull/4975): Keep leading comments on consecutive lines (@lukastaegert)
- [#4979](https://github.com/rollup/rollup/pull/4979): Use correct scope in switch statements (@lukastaegert)

## 3.21.4

_2023-05-03_

### Bug Fixes

- Resolve crash when shimming a missing export in an otherwise non-included module when preserving modules (#4971)

### Pull Requests

- [#4971](https://github.com/rollup/rollup/pull/4971): Handle shimming missing exports when preserving modules ( @lukastaegert)
- [#4972](https://github.com/rollup/rollup/pull/4972): Configure Renovate (@renovate[bot])

## 3.21.3

_2023-05-02_

### Bug Fixes

- Run `process.exit()` when Rollup CLI finishes successfully to solve issues on some systems (#4969)

### Pull Requests

- [#4954](https://github.com/rollup/rollup/pull/4954): test: enable typecheck for \_config files (@antfu)
- [#4969](https://github.com/rollup/rollup/pull/4969): Automatically force close Rollup when done (@lukastaegert)

## 3.21.2

_2023-04-30_

### Bug Fixes

- Mark global functions that trigger iterators as impure for now (#4955)

### Pull Requests

- [#4955](https://github.com/rollup/rollup/pull/4955): fix: mark some known globals or their functions as impure ( @TrickyPi)

## 3.21.1

_2023-04-29_

### Bug Fixes

- Make sure call arguments are properly deoptimized when a function uses the `arguments` variable (#4965)

### Pull Requests

- [#4957](https://github.com/rollup/rollup/pull/4957): Update dependencies (@lukastaegert)
- [#4964](https://github.com/rollup/rollup/pull/4964): Fix REPL in dev (@lukastaegert)
- [#4965](https://github.com/rollup/rollup/pull/4965): Ensure arguments are deoptimized when arguments variable is used (@lukastaegert)
- [#4967](https://github.com/rollup/rollup/pull/4967): Log REPL output to console (@lukastaegert)

## 3.21.0

_2023-04-23_

### Features

- Support tree-shaking of named exports in dynamic imports when using destructuring and similar patterns (#4952)

### Pull Requests

- [#4952](https://github.com/rollup/rollup/pull/4952): feat: tree-shake deterministic dynamic imports (@antfu)

## 3.20.7

_2023-04-21_

### Bug Fixes

- Properly track array element mutations when iterating with a for-of loop (#4949)
- Handle default exporting an anonymous class that extends another class (#4950)

### Pull Requests

- [#4943](https://github.com/rollup/rollup/pull/4943): Add a test for reserved keywords used as import/export specifiers (@Andarist)
- [#4949](https://github.com/rollup/rollup/pull/4949): Deoptimize right side in for-of loops (@lukastaegert)
- [#4950](https://github.com/rollup/rollup/pull/4950): Support default exported classes that extend other classes ( @lukastaegert)

## 3.20.6

_2023-04-18_

### Bug Fixes

- Revert handling of non-JS import and export names due to regressions (#4914)

### Pull Requests

- [#4914](https://github.com/rollup/rollup/pull/4914): feat: add locales in vitepress config (@iDestin)
- [#4946](https://github.com/rollup/rollup/pull/4946): Revert #4939 for now (@lukastaegert)

## 3.20.5

_2023-04-18_

### Bug Fixes

- Handle import and export names that are not valid JavaScript identifiers (#4939)

### Pull Requests

- [#4939](https://github.com/rollup/rollup/pull/4939): Fixed imports/exports that are illegal identifiers in the es output (@Andarist)
- [#4941](https://github.com/rollup/rollup/pull/4941): Reinstate global styles (@lukastaegert)

## 3.20.4

_2023-04-17_

### Bug Fixes

- Do not remove breaks statements after switch statements with conditional breaks (#4937)

### Pull Requests

- [#4937](https://github.com/rollup/rollup/pull/4937): fix: handle conditional breaks in nested switch statement cases ( @TrickyPi and @lukastaegert)

## 3.20.3

_2023-04-16_

### Bug Fixes

- Reduce memory consumption for function call parameter analysis (#4938)
- Fix types for `shouldTransformCachedModule` (#4932)

### Pull Requests

- [#4925](https://github.com/rollup/rollup/pull/4925): chore: repl style add scoped (@btea)
- [#4926](https://github.com/rollup/rollup/pull/4926): docs: Update the x_google_ignorelist url (@jecfish)
- [#4932](https://github.com/rollup/rollup/pull/4932): Allow shouldTransformCachedModule to return null (@bluwy)
- [#4935](https://github.com/rollup/rollup/pull/4935): Bump peter-evans/create-or-update-comment from 2 to 3 ( @dependabot[bot])
- [#4936](https://github.com/rollup/rollup/pull/4936): Disable puppeteer sandbox to fix Vercel deployment ( @lukastaegert)
- [#4938](https://github.com/rollup/rollup/pull/4938): Improve memory usage for parameter deoptimizations ( @lukastaegert)

## 3.20.2

_2023-03-24_

### Bug Fixes

- Fix a crash when using a manual chunk entry that is not already included in the module graph (#4921)
- Fix a crash when reporting a warning with incorrect sourcemap information (#4922)

### Pull Requests

- [#4921](https://github.com/rollup/rollup/pull/4921): Handle manual chunks where the entry is not part of the module graph (@lukastaegert)
- [#4922](https://github.com/rollup/rollup/pull/4922): Do not fail if the location of a warning is outside the original source (@lukastaegert)

## 3.20.1

_2023-03-23_

### Bug Fixes

- Fix returned file name from this.getFileName when assets are deduplicated (#4919)

### Pull Requests

- [#4919](https://github.com/rollup/rollup/pull/4919): Only set asset names when finalizing (@lukastaegert)

## 3.20.0

_2023-03-20_

### Features

- Allow dynamically imported files to have synthetic named exports when preserving modules (#4913)

### Bug Fixes

- Use deterministic file name when emitting several files with same source (#4912)
- Fix a crash when dynamically importing a file with synthetic named exports when preserving modules (#4913)

### Pull Requests

- [#4912](https://github.com/rollup/rollup/pull/4912): fix: make file name deterministic in parallel emits (fix #4909) ( @sun0day)
- [#4913](https://github.com/rollup/rollup/pull/4913): Provide synthetic namespace for dynamic imports when perserving modules (@lukastaegert)

## 3.19.1

_2023-03-10_

### Bug Fixes

- Produce valid code when the first statement in aclass static block is tree-shaken (#4898)

### Pull Requests

- [#4898](https://github.com/rollup/rollup/pull/4898): fix: set a correct node location for static blocks (@TrickyPi)
- [#4900](https://github.com/rollup/rollup/pull/4900): docs: fix table at `output.sanitizeFileName` section (@0x009922)

## 3.19.0

_2023-03-09_

### Features

- Make reassignment tracking of call parameters more specific to no lose information when an object is passed to a function (#4892)

### Pull Requests

- [#4890](https://github.com/rollup/rollup/pull/4890): Fix `npm run dev` (@lukastaegert)
- [#4892](https://github.com/rollup/rollup/pull/4892): Only selectively deoptimize call parameters (@lukastaegert)
- [#4897](https://github.com/rollup/rollup/pull/4897): Pre-render mermaid graphs on website (@lukastaegert)

## 3.18.0

_2023-03-01_

### Features

- Add `experimentalLogSideEffects` to log the first detected side effect in every module (#4871)
- Ignore-list sourcemaps of files inside node_modules by default (#4877)

### Pull Requests

- [#4871](https://github.com/rollup/rollup/pull/4871): Add experimental logging for side effects (@lukastaegert)
- [#4877](https://github.com/rollup/rollup/pull/4877): feat: mark files in a `node_modules` as ignore-listed by default (@bmeurer)
- [#4880](https://github.com/rollup/rollup/pull/4880): build: use @rollup/plugin-replace to replace chokidar fsevents ( @dnalborczyk)
- [#4887](https://github.com/rollup/rollup/pull/4887): Refactor (@dnalborczyk)

## 3.17.3

_2023-02-25_

### Bug Fixes

- Handle non-URL-safe characters when poly-filling import.meta.url (#4875)

### Pull Requests

- [#4870](https://github.com/rollup/rollup/pull/4870): fix: style optimization in dark mode (@huodoushigemi)
- [#4875](https://github.com/rollup/rollup/pull/4875): Fix transformation of `import.meta.url` in CommonJS (@fasttime)
- [#4876](https://github.com/rollup/rollup/pull/4876): fix: wrong params of the transform hook (@ZzqiZQute)
- [#4878](https://github.com/rollup/rollup/pull/4878): Improve test stability (@lukastaegert)

## 3.17.2

_2023-02-20_

### Bug Fixes

- Do not omit code if a file that only re-exports a used variable has `moduleSideEffects` set to `true` (#4867)
- Add missing `needsCodeReference` property in TypeScript for asset tree-shaking (#4868)
- Add correct side effect configuration for additional Object and Promise methods (#4323)

### Pull Requests

- [#4323](https://github.com/rollup/rollup/pull/4323): feat: add known globals (@dnalborczyk)
- [#4867](https://github.com/rollup/rollup/pull/4867): Include side effects of re-exporters unless they have moduleSideEffects: false (@lukastaegert)
- [#4868](https://github.com/rollup/rollup/pull/4868): Add `needsCodeReference` property to `EmittedAsset` (@sapphi-red)

## 3.17.1

_2023-02-18_

### Bug Fixes

- Add TypeScript types for `loadConfigFile` (#4853)
- Fix an issue that could include unused classes in the bundle if their super class was in a file with `moduleSideEffects: false` (#4866)

### Pull Requests

- [#4853](https://github.com/rollup/rollup/pull/4853): feat: export loadConfigFile type (@TrickyPi)
- [#4866](https://github.com/rollup/rollup/pull/4866): Do not mark variable access in files without side effects as TDZ (@lukastaegert)

## 3.17.0

_2023-02-18_

### Features

- Deprecate `experimentalDeepDynamicChunkOptimization` and always run the full chunk generation algorithm (#4862)

### Bug Fixes

- Fix an issue that caused very slow builds for projects with over 1000 dynamic imports when `experimentalDeepDynamicChunkOptimization` was enabled (#4862)

### Pull Requests

- [#4862](https://github.com/rollup/rollup/pull/4862): Improve chunking performance (@lukastaegert)

## 3.16.0

_2023-02-17_

### Features

- Support `output.sourcemapIgnoreList` option to mark file sources as ignored in the `x_google_ignoreList` attribute of the resulting sourcemap (#4848)
- Support sourcemaps where `sourcesContent` contains `null` entries (#4846)
- Allow explicitly passing `true` for the `cache` option to override Vite's default (#4859)

### Bug Fixes

- Fix an issue where unrelated side effects spilled into other chunks when using the `experimentalMinChunkSize` option ( #4851)

### Pull Requests

- [#4846](https://github.com/rollup/rollup/pull/4846): Update magic-string and adjust types. (@bmeurer)
- [#4848](https://github.com/rollup/rollup/pull/4848): Introduce `sourcemapIgnoreList` predicate. (@bmeurer)
- [#4851](https://github.com/rollup/rollup/pull/4851): Fix chunk graph update when merging chunks for minChunkSize ( @lukastaegert)
- [#4852](https://github.com/rollup/rollup/pull/4852): docs: make api params more readable (@cunzaizhuyi)
- [#4856](https://github.com/rollup/rollup/pull/4856): simplify code in includeStatements (@TrickyPi)
- [#4859](https://github.com/rollup/rollup/pull/4859): Allow to pass "true" to InputOptions.cache (@danielrentz)

## 3.15.0

_2023-02-10_

### Features

- Do not consider instantiating a constructor a side effect if it adds properties to "this" and is instantiated elsewhere (#4842)

### Bug Fixes

- Improve side effect detection in constructors (#4842)

### Pull Requests

- [#4842](https://github.com/rollup/rollup/pull/4842): fix: add this option to context.ignore (@TrickyPi)
- [#4843](https://github.com/rollup/rollup/pull/4843): fixed the logo link (@oMatheuss)
- [#4844](https://github.com/rollup/rollup/pull/4844): Update index.md (@cunzaizhuyi)
- [#4845](https://github.com/rollup/rollup/pull/4845): docs: fix style (@TrickyPi)

## 3.14.0

_2023-02-05_

### Features

- Add `experimentalDeepDynamicChunkOptimization` option to produce fewer chunks from dynamic imports (#4837)

### Pull Requests

- [#4837](https://github.com/rollup/rollup/pull/4837): Add flag to re-enable deep dynamic chunk optimization ( @lukastaegert)
- [#4839](https://github.com/rollup/rollup/pull/4839): fix: correct incorrect assertions (@TrickyPi)

## 3.13.0

_2023-02-03_

### Features

- Prevent chunk cycles when using `experimentalMinChunkSize` (#4723)

### Pull Requests

- [#4723](https://github.com/rollup/rollup/pull/4723): Improve minChunkSize algorithm (@lukastaegert)
- [#4833](https://github.com/rollup/rollup/pull/4833): docs: Fix typo (@mturoci)
- [#4835](https://github.com/rollup/rollup/pull/4835): Tables in docs (@lukastaegert)

## 3.12.1

_2023-02-01_

### Bug Fixes

- Handle self-references in class static blocks and construtors when the class is renamed (#4827)
- Improve warnings when creating circular chunks taht reexport variables (#4829)

### Pull Requests

- [#4827](https://github.com/rollup/rollup/pull/4827): fix: use the original class name in the class body (@TrickyPi)
- [#4829](https://github.com/rollup/rollup/pull/4829): Improve and fix cross-chunk-reexport warning (@lukastaegert)
- [#4830](https://github.com/rollup/rollup/pull/4830): Add Algolia doc search (@lukastaegert)
- [#4831](https://github.com/rollup/rollup/pull/4831): Add warning not to add assets directly to the bundle ( @lukastaegert)

## 3.12.0

_2023-01-28_

### Features

- Change generated external namespace reexport helper code for CommonJS to better work with NodeJS named export detection (#4826)

### Pull Requests

- [#4825](https://github.com/rollup/rollup/pull/4825): Add and use anchors for nested options (@lukastaegert)
- [#4826](https://github.com/rollup/rollup/pull/4826): Use old namespace reexport code pattern for better Node support ( @lukastaegert)

## 3.11.0

_2023-01-26_

### Features

- Support opt-in tree-shaking for emitted assets based on code references (#4805)

### Bug Fixes

- Adapt documentation references in Rollup to new website (#4807)

### Pull Requests

- [#4805](https://github.com/rollup/rollup/pull/4805): feat: add needsCodeReference field to EmittedAsset (@TrickyPi)
- [#4807](https://github.com/rollup/rollup/pull/4807): Rewrite website in Vitepress and merge it into the main repository (@lukastaegert)
- [#4816](https://github.com/rollup/rollup/pull/4816): web-publisher: Update docs/faqs/index.md (@PuruVJ)
- [#4819](https://github.com/rollup/rollup/pull/4819): Replace fs-extra with built-ins (@dnalborczyk)
- [#4820](https://github.com/rollup/rollup/pull/4820): Introduce timeout-minutes in Github actions ci (@dnalborczyk)
- [#4822](https://github.com/rollup/rollup/pull/4822): Tweak document landing page (@sapphi-red)
- [#4823](https://github.com/rollup/rollup/pull/4823): Minor migration guide improvements (@sapphi-red)
- [#4824](https://github.com/rollup/rollup/pull/4824): Add most options to the REPL (@lukastaegert)

## 3.10.1

_2023-01-20_

### Bug Fixes

- Fix some crashes when using optional chaining with namespaces and improve tree-shaking (#4812)
- Avoid wrongly removed code when using optional chaining (#4812)

### Pull Requests

- [#4809](https://github.com/rollup/rollup/pull/4809): fix: rollup bin file is in dist folder (@saibotsivad)
- [#4812](https://github.com/rollup/rollup/pull/4812): Rework tree-shaking support for optional chaining (@lukastaegert)

## 3.10.0

_2023-01-12_

### Features

- Add information about the resolving plugin to resolved ids (#4789)
- Improve treeshaking for optional chaining when the root is nullish (#4797)

### Bug Fixes

- Remove unnecessary internal defaults for acorn options (#4786)

### Pull Requests

- [#4785](https://github.com/rollup/rollup/pull/4785): Use @jridgewell/sourcemap-codec (@bluwy)
- [#4786](https://github.com/rollup/rollup/pull/4786): Remove default acorn options + other fixes (@dnalborczyk)
- [#4789](https://github.com/rollup/rollup/pull/4789): feat: add `resolvedBy` field to `ResolvedId` (@TrickyPi)
- [#4794](https://github.com/rollup/rollup/pull/4794): fix: import can be shortened (@cunzaizhuyi)
- [#4796](https://github.com/rollup/rollup/pull/4796): Update dependencies (@lukastaegert)
- [#4797](https://github.com/rollup/rollup/pull/4797): feat: treeshake for optional chaining (@antfu)

## 3.9.1

_2023-01-02_

### Bug Fixes

- Sort keys in generated dynamic namespace objects (#4780)
- Do not consider Array.group to be side effect free as the specs have changed (#4779)

### Pull Requests

- [#4777](https://github.com/rollup/rollup/pull/4777): Import from node:fs/promises (@dnalborczyk)
- [#4778](https://github.com/rollup/rollup/pull/4778): Bump deps (@dnalborczyk)
- [#4779](https://github.com/rollup/rollup/pull/4779): Remove array grouping (web compat issue) (@dnalborczyk)
- [#4780](https://github.com/rollup/rollup/pull/4780): Sort namespace object keys (@dnalborczyk)
- [#4781](https://github.com/rollup/rollup/pull/4781): Use Set and builtin-modules package (@dnalborczyk)
- [#4782](https://github.com/rollup/rollup/pull/4782): Use more restrictive types (@dnalborczyk)

## 3.9.0

_2022-12-28_

### Features

- Support ES2022 arbitrary module namespace identifiers (#4770)
- Add optional `version` property to plugin type (#4771)

### Pull Requests

- [#4768](https://github.com/rollup/rollup/pull/4768): Fix small typo in 999-big-list-of-options.md (@ericmutta)
- [#4769](https://github.com/rollup/rollup/pull/4769): docs: add a instruction about how to run one test on your local computer (@TrickyPi)
- [#4770](https://github.com/rollup/rollup/pull/4770): Add support for arbitrary module namespace identifiers ( @lukastaegert)
- [#4771](https://github.com/rollup/rollup/pull/4771): Add `version` property to Plugin type (@Septh)

## 3.8.1

_2022-12-23_

### Bug Fixes

- Reduce memory footprint when explicitly passing `cache: false` (#4762)
- Fix a crash when preserving modules and reexporting namespaces (#4766)

### Pull Requests

- [#4762](https://github.com/rollup/rollup/pull/4762): Improve AST garbage collection (@bluwy)
- [#4766](https://github.com/rollup/rollup/pull/4766): Fix handling of namespace reexports when preserving modules ( @lukastaegert)

## 3.8.0

_2022-12-22_

### Features

- Deduplicate ESM exports and reexports when preserving modules (#4759)

### Bug Fixes

- Handle files that are emitted as a side effect of the manualChunks option (#4759)

### Pull Requests

- [#4759](https://github.com/rollup/rollup/pull/4759): feat: deduplicate reexports and renderedExports to simplify output (@TrickyPi)
- [#4761](https://github.com/rollup/rollup/pull/4761): Support emitting files via manualChunks in output (@lukastaegert)
- [#4763](https://github.com/rollup/rollup/pull/4763): docs: update outdated info (@TrickyPi)

## 3.7.5

_2022-12-17_

### Bug Fixes

- Avoid name shadowing when default exporting a class that matches the name of another class (#4756)
- Do not display the error message both in a separate line and in the stack trace in rollup CLI (#4749)
- Make type of `RollupWarning.cause` compatible with `Error.cause` (#4757)
- Do not swallow side effects when interacting with modules namespaces nested in another object (#4758)

### Pull Requests

- [#4749](https://github.com/rollup/rollup/pull/4749): feat: simplify `stack` info in cli error (@TrickyPi)
- [#4756](https://github.com/rollup/rollup/pull/4756): Avoid name conflicts for default exported classes (@lukastaegert)
- [#4757](https://github.com/rollup/rollup/pull/4757): fix: RollupLog cause allow unknown (@Shinigami92)
- [#4758](https://github.com/rollup/rollup/pull/4758): Correctly handle side effects when a namespace is nested in an object (@lukastaegert)

## 3.7.4

_2022-12-13_

### Bug Fixes

- Do not remove calls to `.exec` and `.test` for included stateful regular expressions (#4742)

### Pull Requests

- [#4742](https://github.com/rollup/rollup/pull/4742): fix: check whether RegExp have the global or sticky flags set ( @TrickyPi)

## 3.7.3

_2022-12-11_

### Bug Fixes

- Ensure `this.getFileName` no longer returns a placeholder as soon as hash placeholders have been resolved (#4747)

### Pull Requests

- [#4747](https://github.com/rollup/rollup/pull/4747): provide hashed file name when using this.getFileName in generateBundle (@lukastaegert)

## 3.7.2

_2022-12-10_

### Bug Fixes

- Improve chunk generation performance when one module is dynamically imported by many other modules (#4736)

### Pull Requests

- [#4736](https://github.com/rollup/rollup/pull/4736): Improve chunk assignment performance (@lukastaegert)

## 3.7.1

_2022-12-09_

### Bug Fixes

- Ad a hint to use @rollup/plugin-json when imports from a JSON file are not found (#4741)

### Pull Requests

- [#4741](https://github.com/rollup/rollup/pull/4741): fix: provide json hint when importing a no export json file ( @TrickyPi)

## 3.7.0

_2022-12-08_

### Features

- Do not treat `.test` and `.exec` on regular expressions as side effects (#4737)

### Pull Requests

- [#4737](https://github.com/rollup/rollup/pull/4737): feat: add sutiable RegExp prototype methods (@TrickyPi)

## 3.6.0

_2022-12-05_

### Features

- extend `this.getModuleInfo` with information about exports (#4731)

### Pull Requests

- [#4731](https://github.com/rollup/rollup/pull/4731): feat: add `exports` and `exportedBindings` to `Module` class ( @TrickyPi)

## 3.5.1

_2022-12-01_

### Bug Fixes

- Accept functions returning a config in defineConfig (#4728)

### Pull Requests

- [#4728](https://github.com/rollup/rollup/pull/4728): Overload defineConfig to accept a RollupOptionsFunction parameter (@Septh)

## 3.5.0

_2022-11-27_

### Features

- Add `treeshake.manualPureFunctions` to override static analysis for explicit function names (#4718)

### Bug Fixes

- Do not throw when a plugin uses `this.load` without awaiting its result (#4725)

### Pull Requests

- [#4718](https://github.com/rollup/rollup/pull/4718): Add simple way to manually declare pure functions (@lukastaegert)
- [#4725](https://github.com/rollup/rollup/pull/4725): Fix isIncluded error when using rollup-plugin-typescript2 ( @lukastaegert)

## 3.4.0

_2022-11-22_

### Features

- Do not keep unused `Object.freeze` calls on object literals (#4720)

### Pull Requests

- [#4720](https://github.com/rollup/rollup/pull/4720): Only consider Object.freeze a side effect if the argument is used (@lukastaegert)

## 3.3.0

_2022-11-12_

### Features

- Add "experimentalMinChunkSize" option to merge smaller chunks into larger ones (#4705)
- Automatically deduplicate assets again when the source is a `Buffer` (#4712)
- Deduplicate `Buffer` with `string` assets (#4712)

### Bug Fixes

- Support plugins with object hooks when using `perf: true` (#4707)

### Pull Requests

- [#4702](https://github.com/rollup/rollup/pull/4702): docs: add additional tips for heap out of memory (@benmccann)
- [#4705](https://github.com/rollup/rollup/pull/4705): Allow to define minimum chunk size limit (@lukastaegert)
- [#4707](https://github.com/rollup/rollup/pull/4707): Fix perf timers for object hooks (@lukastaegert)
- [#4710](https://github.com/rollup/rollup/pull/4710): Update terser docs (@nikolas)
- [#4712](https://github.com/rollup/rollup/pull/4712): feat: deduplicate assets with buffer source (@patak-dev)

## 3.2.5

_2022-11-01_

### Bug Fixes

- We deconflicting classes, ensure the original class name still does not shadow variables (#4697)

### Pull Requests

- [#4697](https://github.com/rollup/rollup/pull/4697): Prevent class ids from shadowing other variables (@lukastaegert)

## 3.2.4

_2022-10-31_

### Bug Fixes

- Always use forward slashes in chunk ids when preserving modules, even on Windows (#4693)
- Escape problematic characters in ids when rewriting `import.meta.url` (#4693)

### Pull Requests

- [#4685](https://github.com/rollup/rollup/pull/4685): update package-lock version (@jerry-lllman)
- [#4689](https://github.com/rollup/rollup/pull/4689): Update 07-tools.md (@cokert)
- [#4693](https://github.com/rollup/rollup/pull/4693): Use correct import.meta.url slashes on Windows (@lukastaegert)

## 3.2.3

_2022-10-18_

### Bug Fixes

- Fix an issue whre Rollup confused `new.target` with `import.meta` (#4679)
- Ensure that Rollup does not make assumptions about the value of unknown namespace import members (#4684)

### Pull Requests

- [#4679](https://github.com/rollup/rollup/pull/4679): Do not rewrite new.target (@lukastaegert)
- [#4683](https://github.com/rollup/rollup/pull/4683): Remove typo in resolveId documentation (@ChrispyChris)
- [#4684](https://github.com/rollup/rollup/pull/4684): Return correct values for unknown namespace members ( @lukastaegert)

## 3.2.2

_2022-10-16_

### Bug Fixes

- Do not hang/crash on hashbang comments in input modules (#4676)

### Pull Requests

- [#4675](https://github.com/rollup/rollup/pull/4675): refactor: improve & simplify types (@sxzz)
- [#4676](https://github.com/rollup/rollup/pull/4676): Ignore hashhbang comments (@lukastaegert)

## 3.2.1

_2022-10-16_

### Bug Fixes

- Rewrite class declarations to preserve their .name property if necessary (#4674)

### Pull Requests

- [#4674](https://github.com/rollup/rollup/pull/4674): Preserve rendered class names (@lukastaegert)

## 3.2.0

_2022-10-15_

### Features

- Support providing Promises as plugins like Vite (#4671)

### Pull Requests

- [#4666](https://github.com/rollup/rollup/pull/4666): Add unicorn plugin (@lukastaegert)
- [#4667](https://github.com/rollup/rollup/pull/4667): refactor: improve types (@sxzz)
- [#4668](https://github.com/rollup/rollup/pull/4668): fix: nested plugin in options stage (@sxzz)
- [#4669](https://github.com/rollup/rollup/pull/4669): refactor: merge duplicate imports (@c0dedance)
- [#4670](https://github.com/rollup/rollup/pull/4670): docs: fix minor typo in migration documentation (@ThisIsMissEm)
- [#4671](https://github.com/rollup/rollup/pull/4671): feat: support async plugins (@sxzz)

## 3.1.0

_2022-10-12_

### Features

- Support using arrays of plugins as plugins like Vite (#4657)

### Pull Requests

- [#4657](https://github.com/rollup/rollup/pull/4657): feat: support nested plugin (@sxzz)

## 3.0.1

_2022-10-12_

### Bug Fixes

- Fix installation on Windows (#4662)
- Avoid missing parameters that are only used in a destructuring initializer (#4663)

### Pull Requests

- [#4661](https://github.com/rollup/rollup/pull/4661): Enforce type imports (@lukastaegert)
- [#4662](https://github.com/rollup/rollup/pull/4662): fix: missing "node" causes run script error (@c0dedance)
- [#4663](https://github.com/rollup/rollup/pull/4663): Ensure the initializer of a destructuring declaration is always included if the id is included (@lukastaegert)
- [#4664](https://github.com/rollup/rollup/pull/4664): fix: remove lint:js:nofix script redundancy options (@c0dedance)

## 3.0.0

_2022-10-11_

### Breaking Changes

#### General Changes

- Rollup now requires at least Node 14.18.0 to run (#4548 and #4596)
- The browser build has been split into a separate package `@rollup/browser` (#4593)
- The node build uses the `node:` prefix for imports of builtin modules (#4596)
- Some previously deprecated features have been removed (#4552):
  - Some plugin context functions have been removed:
    - `this.emitAsset()`: use `this.emitFile()`
    - `this.emitChunk()`: use `this.emitFile()`
    - `this.getAssetFileName()`: use `this.getFileName()`
    - `this.getChunkFileName()`: use `this.getFileName()`
    - `this.isExternal()`: use `this.resolve()`
    - `this.resolveId()`: use `this.resolve()`
  - The `resolveAssetUrl` plugin hook has been removed: use `resolveFileUrl`
  - Rollup no longer passes `assetReferenceId` or `chunkReferenceId` parameters to `resolveFileUrl`
  - The `treeshake.pureExternalModules` option has been removed: use `treeshake.moduleSideEffects: 'no-external'`
  - You may no longer use `true` or `false` for `output.interop`. As a replacement for `true`, you can use "compat"
  - Emitted assets no longer have an `isAsset` flag in the bundle
  - Rollup will no longer fix assets added directly to the bundle by adding the `type: "asset"` field
- Some features that were previously marked for deprecation now show warnings when used (#4552):
  - Some options have been deprecated:
    - `inlineDynamicImports` as part of the input options: use `output. inlineDynamicImports`
    - `manualChunks` as part of the input options: use `output. manualChunks `
    - `maxParallelFileReads`: use `maxParallelFileOps
    - `output.preferConst`: use `output.generatedCode.constBindings`
    - `output.dynamicImportFunction`: use the `renderDynamicImport` plugin hook
    - `output.namespaceToStringTag`: use `output.generatedCode.symbols`
    - `preserveModules` as part of the input options: use `output. preserveModules `
  - You should no longer access `this.moduleIds` in plugins: use `this.getModuleIds()`
  - You should no longer access `this.getModuleInfo(...).hasModuleSideEffects` in plugins: use `this.getModuleInfo(...).moduleSideEffects`
- Configuration files are only bundled if either the `--configPlugin` or the `--bundleConfigAsCjs` options are used. The configuration is bundled to an ES module unless the `--bundleConfigAsCjs` option is used. In all other cases, configuration is now loaded using Node's native mechanisms (#4574 and #4621)
- The properties attached to some errors have been changed so that there are fewer different possible properties with consistent types (#4579)
- Some errors have been replaced by others (ILLEGAL_NAMESPACE_REASSIGNMENT -> ILLEGAL_REASSIGNMENT, NON_EXISTENT_EXPORT -> MISSING_EXPORT) (#4579)
- Files in `rollup/dist/*` can only be required using their file extension (#4581)
- The `loadConfigFile` helper now has a named export of the same name instead of a default export (#4581)
- When using the API and sourcemaps, sourcemap comments are contained in the emitted files and sourcemaps are emitted as regular assets (#4605)
- Watch mode no longer uses Node's EventEmitter but a custom implementation that awaits Promises returned from event handlers (#4609)
- Assets may only be deduplicated with previously emitted assets if their source is a `string` (#4644)
- By default, Rollup will keep external dynamic imports as `import(…)` in commonjs output unless `output.dynamicImportInCjs` is set to false (#4647)

#### Changes to Rollup Options

- As functions passed to `output.banner/footer/intro/outro` are now called per-chunk, they should be careful to avoid performance-heavy operations (#4543)
- `entryFileNames/chunkFileNames` functions now longer have access to the rendered module information via `modules`, only to a list of included `moduleIds` (#4543)
- The path of a module is no longer prepended to the corresponding chunk when preserving modules (#4565)
- When preserving modules, the `[name]` placeholder (as well as the `chunkInfo.name` property when using a function) now includes the relative path of the chunk as well as optionally the file extension if the extension is not one of `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, or `.cts` (#4565)
- The `[ext]`, `[extName]` and `[assetExtName]` placeholders are no longer supported when preserving modules (#4565)
- The `perf` option no longer collects timings for the asynchronous part of plugin hooks as the readings were wildly inaccurate and very misleading, and timings are adapted to the new hashing algorithm (#4566)
- Change the default value of `makeAbsoluteExternalsRelative` to "ifRelativeSource" so that absolute external imports will no longer become relative imports in the output, while relative external imports will still be renormalized ( #4567)
- Change the default for `output.generatedCode.reservedNamesAsProps` to no longer quote properties like `default` by default (#4568)
- Change the default for `preserveEntrySignatures` to "exports-only" so that by default, empty facades for entry chunks are no longer created (#4576)
- Change the default for `output.interop` to "default" to better align with NodeJS interop (#4611)
- Change the default for `output.esModule` to "if-default-prop", which only adds \_\_esModule when the default export would be a property (#4611)
- Change the default for `output.systemNullSetters` to `true`, which requires at least SystemJS 6.3.3 (#4649)

#### Plugin API Changes

- Plugins that add/change/remove imports or exports in `renderChunk` should make sure to update `ChunkInfo.imports/importedBindings/exports` accordingly (#4543)
- The order of plugin hooks when generating output has changed (#4543)
- Chunk information passed to `renderChunk` now contains names with hash placeholders instead of final names, which will be replaced when used in the returned code or `ChunkInfo.imports/importedBindings/exports` (#4543 and #4631)
- Hooks defined in output plugins will now run after hooks defined in input plugins (used to be the other way around) ( #3846)

### Features

- Functions passed to `output.banner/footer/intro/outro` are now called per-chunk with some chunk information (#4543)
- Plugins can access the entire chunk graph via an additional parameter in `renderChunk` (#4543)
- Chunk hashes only depend on the actual content of the chunk and are otherwise stable against things like renamed/moved source files or changed module resolution order (#4543)
- The length of generated file hashes can be customized both globally and per-chunk (#4543)
- When preserving modules, the regular `entryFileNames` logic is used and the path is included in the `[name]` property. This finally gives full control over file names when preserving modules (#4565)
- `output.entryFileNames` now also supports the `[hash]` placeholder when preserving modules (#4565)
- The `perf` option will now collect (synchronous) timings for all plugin hooks, not just a small selection (#4566)
- All errors thrown by Rollup have `name: RollupError` now to make clearer that those are custom error types (#4579)
- Error properties that reference modules (such as id and ids) will now always contain the full ids. Only the error message will use shortened ids (#4579)
- Errors that are thrown in response to other errors (e.g. parse errors thrown by acorn) will now use the standardized cause property to reference the original error (#4579)
- If sourcemaps are enabled, files will contain the appropriate sourcemap comment in `generateBundle` and sourcemap files are available as regular assets (#4605)
- Returning a Promise from an event handler attached to a RollupWatcher instance will make Rollup wait for the Promise to resolve (#4609)
- There is a new value "compat" for output.interop that is similar to "auto" but uses duck-typing to determine if there is a default export (#4611)
- There is a new value "if-default-prop" for esModule that only adds an `__esModule` marker to the bundle if there is a default export that is rendered as a property (#4611)
- Rollup can statically resolve checks for `foo[Symbol.toStringTag]` to "Module" if foo is a namespace (#4611)
- There is a new CLI option `--bundleConfigAsCjs` which will force the configuration to be bundled to CommonJS (#4621)
- Import assertions for external imports that are present in the input files will be retained in ESM output (#4646)
- Rollup will warn when a module is imported with conflicting import assertions (#4646)
- Plugins can add, remove or change import assertions when resolving ids (#4646)
- The `output.externalImportAssertions` option allows to turn off emission of import assertions (#4646)
- Use `output.dynamicImportInCjs` to control if dynamic imports are emitted as `import(…)` or wrapped `require(…)` when generating commonjs output (#4647)

### Bug Fixes

- Chunk hashes take changes in `renderChunk`, e.g. minification, into account (#4543)
- Hashes of referenced assets are properly reflected in the chunk hash (#4543)
- No longer warn about implicitly using default export mode to not tempt users to switch to named export mode and break Node compatibility (#4624)
- Avoid performance issues when emitting thousands of assets (#4644)

### Pull Requests

- [#3846](https://github.com/rollup/rollup/pull/3846): [v3.0] Run output plugins last (@aleclarson)
- [#4543](https://github.com/rollup/rollup/pull/4543): [v3.0] New hashing algorithm that "fixes (nearly) everything" ( @lukastaegert)
- [#4548](https://github.com/rollup/rollup/pull/4548): [v3.0] Deprecate Node 12 (@lukastaegert)
- [#4552](https://github.com/rollup/rollup/pull/4552): [v3.0] Remove actively deprecated features, show warnings for other deprecated features (@lukastaegert)
- [#4558](https://github.com/rollup/rollup/pull/4558): [v3.0] Convert build scripts to ESM, update dependencies ( @lukastaegert)
- [#4565](https://github.com/rollup/rollup/pull/4565): [v3.0] Rework file name patterns when preserving modules ( @lukastaegert)
- [#4566](https://github.com/rollup/rollup/pull/4566): [v3.0] Restructure timings (@lukastaegert)
- [#4567](https://github.com/rollup/rollup/pull/4567): [v3.0] Change default for makeAbsoluteExternalsRelative ( @lukastaegert)
- [#4568](https://github.com/rollup/rollup/pull/4568): [v3.0] Change default for output.generatedCode.reservedNamesAsProps (@lukastaegert)
- [#4574](https://github.com/rollup/rollup/pull/4574): [v3.0] Better esm config file support (@lukastaegert)
- [#4575](https://github.com/rollup/rollup/pull/4575): [v3.0] Show deprecation warning for maxParallelFileReads ( @lukastaegert)
- [#4576](https://github.com/rollup/rollup/pull/4576): [v3.0] Change default for preserveEntrySignatures to exports-only (@lukastaegert)
- [#4579](https://github.com/rollup/rollup/pull/4579): [v3.0] Refine errors and warnings (@lukastaegert)
- [#4581](https://github.com/rollup/rollup/pull/4581): [v3.0] Use named export for loadConfigFile (@lukastaegert)
- [#4592](https://github.com/rollup/rollup/pull/4592): [v3.0] Port doc changes from #4572 and #4583 to 3.0 (@berniegp)
- [#4593](https://github.com/rollup/rollup/pull/4593): [v3.0] Browser build (@lukastaegert)
- [#4596](https://github.com/rollup/rollup/pull/4596): [v3.0] Use "node:" prefix for imports of node builtins ( @lukastaegert)
- [#4605](https://github.com/rollup/rollup/pull/4605): [v3.0] Better sourcemap emission (@lukastaegert)
- [#4609](https://github.com/rollup/rollup/pull/4609): [v3.0] Custom awaiting watch emitter (@lukastaegert)
- [#4611](https://github.com/rollup/rollup/pull/4611): [v3.0] Improve interop defaults (@lukastaegert)
- [#4621](https://github.com/rollup/rollup/pull/4621): [v3.0] Always try to load config files via Node if possible ( @lukastaegert)
- [#4624](https://github.com/rollup/rollup/pull/4624): [v3.0] Remove warning when using implicit default export mode ( @lukastaegert)
- [#4631](https://github.com/rollup/rollup/pull/4631): [v3.0] Use ASCII characters for hash placeholders (@lukastaegert)
- [#4644](https://github.com/rollup/rollup/pull/4644): [v3.0] Improve performance of asset emissions (@lukastaegert)
- [#4646](https://github.com/rollup/rollup/pull/4646): [v3.0] Basic support for import assertions (@lukastaegert)
- [#4647](https://github.com/rollup/rollup/pull/4647): [v3.0] Keep dynamic imports in CommonJS output (@lukastaegert)
- [#4649](https://github.com/rollup/rollup/pull/4649): [v3.0] Change default for systemNullSetters (@lukastaegert)
- [#4651](https://github.com/rollup/rollup/pull/4651): [v3.0] use compiler target ES2020 (@dnalborczyk)

For previous changelogs, see

- [Rollup 2.x](./CHANGELOG-2.md)
- [Rollup 1.x](./CHANGELOG-1.md)
- [Rollup 0.x](./CHANGELOG-0.md)
