# rollup changelog

## 2.79.1

_2022-09-22_

### Bug Fixes

- Avoid massive performance degradation when creating thousands of chunks (#4643)

### Pull Requests

- [#4639](https://github.com/rollup/rollup/pull/4639): fix: typo docs and contributors link in CONTRIBUTING.md ( @takurinton)
- [#4641](https://github.com/rollup/rollup/pull/4641): Update type definition of resolveId (@ivanjonas)
- [#4643](https://github.com/rollup/rollup/pull/4643): Improve performance of chunk naming collision check ( @lukastaegert)

## 2.79.0

_2022-08-31_

### Features

- Add `amd.forceJsExtensionForImports` to enforce using `.js` extensions for relative AMD imports (#4607)

### Pull Requests

- [#4607](https://github.com/rollup/rollup/pull/4607): add option to keep extensions for amd (@wh1tevs)

## 2.78.1

_2022-08-19_

### Bug Fixes

- Avoid inferring "arguments" as name for a default export placeholder variable (#4613)

### Pull Requests

- [#4613](https://github.com/rollup/rollup/pull/4613): Prevent using arguments for generated variable names ( @lukastaegert)

## 2.78.0

_2022-08-14_

### Features

- Support writing plugin hooks as objects with a "handler" property (#4600)
- Allow changing execution order per plugin hook (#4600)
- Add flag to execute plugins in async parallel hooks sequentially (#4600)

### Pull Requests

- [#4600](https://github.com/rollup/rollup/pull/4600): Allow using objects as hooks to change execution order ( @lukastaegert)

## 2.77.3

_2022-08-11_

### Bug Fixes

- Correctly resolve preserveModulesRoot in Vite (#4591)

### Pull Requests

- [#4591](https://github.com/rollup/rollup/pull/4591): resolve currentPath (@cleverpp)

## 2.77.2

_2022-07-27_

### Bug Fixes

- Avoid a rendering failure when mixing outputs with inlined and non-inlined dynamic imports (#4589)

### Pull Requests

- [#4589](https://github.com/rollup/rollup/pull/4589): Handle generating non-inlined imports after inlined ones ( @lukastaegert)

## 2.77.1

_2022-07-26_

### Bug Fixes

- Ensure IIFE output generates a global variable when generating ES5 (#4588)

### Pull Requests

- [#4577](https://github.com/rollup/rollup/pull/4577): broken link removed (@Jawad-H)
- [#4580](https://github.com/rollup/rollup/pull/4580): Update dependencies (@lukastaegert)
- [#4584](https://github.com/rollup/rollup/pull/4584): Documentation clarity and syntax improvements (@berniegp)
- [#4588](https://github.com/rollup/rollup/pull/4588): Use var for IIFE (@lukastaegert)

## 2.77.0

_2022-07-15_

### Features

- Introduce `maxParallelFileOps` to limit both read and write operations, default to 20 and replaces `maxParallelFileRead` (#4570)

### Bug Fixes

- Avoid including variables referenced from return statements that are never reached (#4573)

### Pull Requests

- [#4570](https://github.com/rollup/rollup/pull/4570): Introduce maxParallelFileOps to limit parallel writes ( @lukastaegert)
- [#4572](https://github.com/rollup/rollup/pull/4572): Document more ways to read package.json in ESM (@berniegp)
- [#4573](https://github.com/rollup/rollup/pull/4573): Do not include unused return expressions (@lukastaegert)

## 2.76.0

_2022-07-08_

### Features

- Allow setting a `sourcmapBaseUrl` for absolute paths in sourcemaps (#4527)

### Bug Fixes

- Support absolute CLI plugin paths on Windows (#4533)

### Pull Requests

- [#4527](https://github.com/rollup/rollup/pull/4527): Add sourcemapBaseUrl option (@nickgarlis)
- [#4533](https://github.com/rollup/rollup/pull/4533): Add support for absolute plugin paths (@ygoe)
- [#4538](https://github.com/rollup/rollup/pull/4538): chore: Included githubactions in the dependabot config ( @naveensrinivasan)
- [#4546](https://github.com/rollup/rollup/pull/4546): Adapt Node versions on CI to prepare for v3 (@lukastaegert)
- [#4556](https://github.com/rollup/rollup/pull/4556): Improve error message for invalid patterns (@DysphoricUnicorn)
- [#4559](https://github.com/rollup/rollup/pull/4559): Update dependencies (@lukastaegert)
- [#4560](https://github.com/rollup/rollup/pull/4560): Bump peter-evans/create-or-update-comment from 1 to 2 ( @dependabot)
- [#4561](https://github.com/rollup/rollup/pull/4561): Bump peter-evans/find-comment from 1 to 2 (@dependabot)
- [#4562](https://github.com/rollup/rollup/pull/4562): Bump codecov/codecov-action from 1 to 3 (@dependabot)

## 2.75.7

_2022-06-20_

### Bug Fixes

- Mark Array.prototype.group/groupToMap as side effect free. (#4531)

### Pull Requests

- [#4523](https://github.com/rollup/rollup/pull/4523): chore: remove source map workaround, bump deps (@dnalborczyk)
- [#4525](https://github.com/rollup/rollup/pull/4525): Add regression tests for instanceof (@lukastaegert)
- [#4528](https://github.com/rollup/rollup/pull/4528): chore: Set permissions for GitHub actions (@naveensrinivasan)
- [#4531](https://github.com/rollup/rollup/pull/4531): fix: rename Array.prototype.group/groupToMap (@dnalborczyk)
- [#4535](https://github.com/rollup/rollup/pull/4535): chore: bump resolve from 1.22.0 to 1.22.1 (@pos777)

## 2.75.6

_2022-06-07_

### Bug Fixes

- Properly deoptimize "this" when using member expressions with getters/setters in for loops and update expressions ( #4522)

### Pull Requests

- [#4522](https://github.com/rollup/rollup/pull/4522): Refactor side effect handling for property interactions ( @lukastaegert)

## 2.75.5

_2022-06-01_

### Bug Fixes

- Avoid crashes when using logical expressions for unused constructor arguments (#4519)
- Fix missing parameter defaults for calls from try statements and functions returned by functions (#4520)

### Pull Requests

- [#4519](https://github.com/rollup/rollup/pull/4519): Try to make logical expression deoptimization more robust ( @lukastaegert)
- [#4520](https://github.com/rollup/rollup/pull/4520): Roll back parameter default tree shaking (@lukastaegert)

## 2.75.4

_2022-05-31_

### Bug Fixes

- Ensure parameter defaults are retained when a function is used as an object property (#4516)

### Pull Requests

- [#4516](https://github.com/rollup/rollup/pull/4516): Deoptimize parameter defaults when referenced from object/array/class literals (@lukastaegert)

## 2.75.3

_2022-05-29_

### Bug Fixes

- Retain parameter defaults for functions that are defaults themselves (#4515)
- Track mutations for objects as default values (#4515)

### Pull Requests

- [#4515](https://github.com/rollup/rollup/pull/4515): Ensure parameter defaults are deoptimized (@lukastaegert)

## 2.75.1

_2022-05-28_

### Pull Requests

- [#4513](https://github.com/rollup/rollup/pull/4513): Update link to node polyfill repo (@lukastaegert)

## 2.75.0

_2022-05-27_

### Features

- Re-implement default parameter tree-shaking for top-level functions (#4510)
- Do not consider calling string methods like `.trim()` on template literals a side effect (#4511)

### Pull Requests

- [#4510](https://github.com/rollup/rollup/pull/4510): Tree-shake parameter defaults (replaces #4498) (@lukastaegert)
- [#4511](https://github.com/rollup/rollup/pull/4511): Tree-shake side-effect-free string methods on template literals ( @lukastaegert)

## 2.74.1

_2022-05-19_

### Bug Fixes

- Revert #4498 until some issues are understood and resolved

## 2.74.0

_2022-05-19_

### Features

- Remove unneeded default values for function parameters (#4498)

### Bug Fixes

- Use a consistent mechanism to resolve the config file to avoid issues on Windows (#4501)
- Avoid an inaccurate warning about an event emitter leak for complicated builds (#4502)
- Ensure that reexporting values from other chunks via dynamic imports does not reference non-imported variables (#4499)

### Pull Requests

- [#4498](https://github.com/rollup/rollup/pull/4498): Tree shake parameter defaults (@lukastaegert)
- [#4499](https://github.com/rollup/rollup/pull/4499): Ensure reexports are available for namespaces (@lukastaegert)
- [#4501](https://github.com/rollup/rollup/pull/4501): fix: config path problem on windows (@pos777)
- [#4502](https://github.com/rollup/rollup/pull/4502): Avoid maximum listeners exceeded warning (@lukastaegert)

## 2.73.0

_2022-05-13_

### Features

- Do not treat Object.defineProperty/ies as side effect when called on an unused object (#4493)
- Do not assume that assigning a property can create a getter with side effects (#4493)
- Do not treat string.prototype.replace(All) as side effect when used with two literals (#4493)

### Bug Fixes

- Detect side effects when manually declaring getters on functions (#4493)

### Pull Requests

- [#4493](https://github.com/rollup/rollup/pull/4493): Handle getters on functions and improve property deoptimization ( @lukastaegert)
- [#4494](https://github.com/rollup/rollup/pull/4494): Do not treat string.replace as side effect when used with a literal (@lukastaegert)
- [#4495](https://github.com/rollup/rollup/pull/4495): Update docs for --configPlugin using typescript ( @Jimmydalecleveland)

## 2.72.1

_2022-05-07_

### Bug Fixes

- Improve tree-shaking of classes with super classes in certain scenarios (#4489)

### Pull Requests

- [#4489](https://github.com/rollup/rollup/pull/4489): Do not deoptimize entire super class when adding a property ( @lukastaegert)

## 2.72.0

_2022-05-05_

### Features

- Add CLI hooks to run external commands at certain points in watch mode (#4457)

### Bug Fixes

- Fix an issue that could accidentally treat relevant assignments as side effect free (#4486)

### Pull Requests

- [#4457](https://github.com/rollup/rollup/pull/4457): feat: CLI event hook flags (@Harris-Miller)
- [#4486](https://github.com/rollup/rollup/pull/4486): Fix reassignment tracking (@lukastaegert)

## 2.71.1

_2022-04-30_

### Bug Fixes

- Allow importing loadConfigFile without extension (#4483)

### Pull Requests

- [#4483](https://github.com/rollup/rollup/pull/4483): Add exports exception for loadConfigFile (@lukastaegert)

## 2.71.0

_2022-04-30_

## Features

- Mark `Object.hasOwn` as pure (#4482)

### Bug Fixes

- Prevent infinite recursion and display proper warning for recursive reexports (#4472)
- Fix type issue in TypeScript nightly (#4471)

### Pull Requests

- [#4467](https://github.com/rollup/rollup/pull/4467): docs: update deprecated option in tools.md (@kimjh96)
- [#4471](https://github.com/rollup/rollup/pull/4471): Fix: tsc did not build (@frank-dspeed)
- [#4472](https://github.com/rollup/rollup/pull/4472): Throw proper error when indirectly reexporting a recursive binding (@lukastaegert)
- [#4475](https://github.com/rollup/rollup/pull/4475): chore: bump deps (#4475) (@dnalborczyk)
- [#4477](https://github.com/rollup/rollup/pull/4477): chore: bump github actions (@dnalborczyk)
- [#4478](https://github.com/rollup/rollup/pull/4478): ci: test with node.js v18, remove v17 (@dnalborczyk)
- [#4479](https://github.com/rollup/rollup/pull/4479): chore(repo): replace `git.io` in the issue template (@SukkaW)
- [#4482](https://github.com/rollup/rollup/pull/4482): feat: add Object.hasOwn as pure function (@dnalborczyk)

## 2.70.2

_2022-04-15_

### Bug Fixes

- Do not enforce undefined return values in TypeScript types (#4463)

### Pull Requests

- [#4463](https://github.com/rollup/rollup/pull/4463): use void for options hook instead of undefined (@ycmjason)

## 2.70.1

_2022-03-14_

### Bug Fixes

- Handle unfinished hook action errors as regular errors and avoid console logging (#4434)
- Allow access to "dist" folder in a Node 17 compatible way (#4436)

### Pull Requests

- [#4434](https://github.com/rollup/rollup/pull/4434): Track unfinished hook actions as regular errors (@lukastaegert)
- [#4436](https://github.com/rollup/rollup/pull/4436): Update package.json (@frank-dspeed)

## 2.70.0

_2022-03-07_

### Features

- Make the `watchChange` and `closeWatcher` hooks asynchronous and make Rollup wait for these hooks before continuing ( #4427)

### Bug Fixes

- Do not abort watch mode for errors in `watchChange` but display them properly (#4427)

### Pull Requests

- [#4427](https://github.com/rollup/rollup/pull/4427): Do not abort watch mode on errors in watchChange (@lukastaegert)

## 2.69.2

_2022-03-06_

### Bug Fixes

- Mark `Object.entries` and `Object.fromEntries` as pure (#4429)
- Make sure new properties on Array.prototype and Object.prototype are not evaluated as "undefined" (#4428)

### Pull Requests

- [#4428](https://github.com/rollup/rollup/pull/4428): Treat unknown prototype props as unknown (@lukastaegert)
- [#4429](https://github.com/rollup/rollup/pull/4429): Treat unknown prototype props as unknown (@869288142)

## 2.69.1

_2022-03-04_

### Bug Fixes

- Approximate source position instead of ignoring it when using a low-resolution source map in a transform hook (#4334)

### Pull Requests

- [#4334](https://github.com/rollup/rollup/pull/4334): fix(sourcemap): fall back to low-resolution line mapping ( @aleclarson and @lukastaegert)

## 2.69.0

_2022-03-02_

### Features

- Introduce new `output.generatedCode.symbols` to control the usage of Symbols in Rollup-generated code (#4378)
- soft-deprecate `output.namespaceToStringTag` in favor of `output.generatedCode.symbols` (#4378)

### Bug Fixes

- Properly handle `./` and `../` as external dependencies (#4419)
- Make generated "Module" namespace toStringTag non-enumerable for correct Object.assign/spread behaviour (#4378)
- Add file name to error when top-level-await is used in disallowed formats (#4421)

### Pull Requests

- [#4378](https://github.com/rollup/rollup/pull/4378): Make namespace @@toStringTag "Module" non-enumerable ( @dnalborczyk and @lukastaegert)
- [#4413](https://github.com/rollup/rollup/pull/4413): refactor: some code and type fixes (@dnalborczyk)
- [#4418](https://github.com/rollup/rollup/pull/4418): chore: bump deps (@dnalborczyk)
- [#4419](https://github.com/rollup/rollup/pull/4419): Properly handle upper directories as external dependencies ( @lukastaegert)
- [#4421](https://github.com/rollup/rollup/pull/4421): Improve the error prompt and output the error file name ( @caoxiemeihao)
- [#4423](https://github.com/rollup/rollup/pull/4423): Update 999-big-list-of-options.md (@leoj3n)

## 2.68.0

_2022-02-22_

### Features

- provide information about cached import resolutions in `shouldTransformCachedModule` (#4414)
- Add "types" field to Rollup's package exports (#4416)

### Pull Requests

- [#4410](https://github.com/rollup/rollup/pull/4410): refactor: use map for declarations and name suggestions ( @dnalborczyk)
- [#4411](https://github.com/rollup/rollup/pull/4411): refactor: use map for namespace reexports by name (@dnalborczyk)
- [#4412](https://github.com/rollup/rollup/pull/4412): refactor: use includes where appropriate (@dnalborczyk)
- [#4414](https://github.com/rollup/rollup/pull/4414): Add resolved sources to shouldTransformCachedModule ( @lukastaegert)
- [#4416](https://github.com/rollup/rollup/pull/4416): Add Typescript 4.5 nodenext node12 module resolution support ( @frank-dspeed)

## 2.67.3

_2022-02-18_

### Bug Fixes

- Do not swallow other errors when unfinished hook actions are detected (#4409)
- Add additional information to output when there are unfinished hook actions (#4409)

### Pull Requests

- [#4399](https://github.com/rollup/rollup/pull/4399): docs: remove const (@TrickyPi)
- [#4401](https://github.com/rollup/rollup/pull/4401): Improve test stability by getting independent of module id ordering in more places (@lukastaegert)
- [#4403](https://github.com/rollup/rollup/pull/4403): fix: remove unnecessary property descriptor spread (@dnalborczyk)
- [#4404](https://github.com/rollup/rollup/pull/4404): refactor: use map for import descriptions + re-export descriptions (@dnalborczyk)
- [#4405](https://github.com/rollup/rollup/pull/4405): refactor: module exports to map (@dnalborczyk)
- [#4406](https://github.com/rollup/rollup/pull/4406): Fix a typo in 'Direct plugin communication' code example ( @younesmln)
- [#4407](https://github.com/rollup/rollup/pull/4407): Document how resolveId is cached (@lukastaegert)
- [#4409](https://github.com/rollup/rollup/pull/4409): Print ids for unfinished moduleParsed and shouldTransformCachedModule hooks (@lukastaegert)

## 2.67.2

_2022-02-10_

### Bug Fixes

- Ensure consistent order between manual chunks to fix hashing issues (#4397)

### Pull Requests

- [#4390](https://github.com/rollup/rollup/pull/4390): refactor: add @types/estree explicitly, fix dynamic type imports (@dnalborczyk)
- [#4391](https://github.com/rollup/rollup/pull/4391): chore: remove acorn-walk ambient type definitions (@dnalborczyk)
- [#4397](https://github.com/rollup/rollup/pull/4397): Sort manual chunks generated via a function by name ( @lukastaegert)

## 2.67.1

_2022-02-07_

### Bug Fixes

- Make chunk file and variable names more deterministic when emitting chunks (#4386)
- Improve default module resolver performance by using non-blocking IO (#4386)

### Pull Requests

- [#4373](https://github.com/rollup/rollup/pull/4373): fix: even more types (@dnalborczyk)
- [#4382](https://github.com/rollup/rollup/pull/4382): Update contribution tut link desc (@lemredd)
- [#4383](https://github.com/rollup/rollup/pull/4383): chore: bump deps (@dnalborczyk)
- [#4384](https://github.com/rollup/rollup/pull/4384): chore: move "wait" to utils + re-use (@dnalborczyk)
- [#4385](https://github.com/rollup/rollup/pull/4385): refactor: convert watch tests to async functions (@dnalborczyk)
- [#4386](https://github.com/rollup/rollup/pull/4386): refactor: use fs.promises in resolve id, Part 4 (@dnalborczyk and @lukastaegert)
- [#4389](https://github.com/rollup/rollup/pull/4389): refactor: use fs.promises in generate license file, rollup config, Part 5 (@dnalborczyk)

## 2.67.0

_2022-02-02_

### Features

- Improve side effect detection when using Array.prototype.groupBy/groupByToMap (#4360)
- Allow changing `moduleSideEffects` at any time during the build (#4379)
- Soft-deprecate `ModuleInfo.hasModuleSideEffects` in favour of `ModuleInfo.moduleSideEffects` (#4379)

### Bug Fixes

- Do not include queries and hashes in generated file names when preserving modules (#4374)

### Pull Requests

- [#4319](https://github.com/rollup/rollup/pull/4319): refactor: use fs, fs-extra, remove sander (@dnalborczyk)
- [#4360](https://github.com/rollup/rollup/pull/4360): feat: add Array.prototype.groupBy/groupByToMap (@dnalborczyk)
- [#4361](https://github.com/rollup/rollup/pull/4361): fix: more types (@dnalborczyk)
- [#4369](https://github.com/rollup/rollup/pull/4369): fix: remove acorn-walk patch (@dnalborczyk)
- [#4371](https://github.com/rollup/rollup/pull/4371): refactor: use fs.promises in cli/run (@dnalborczyk)
- [#4372](https://github.com/rollup/rollup/pull/4372): refactor: use fs.promises in module loader (@dnalborczyk)
- [#4374](https://github.com/rollup/rollup/pull/4374): Ignore queries and hashes in file names when preserving modules ( @lukastaegert)
- [#4375](https://github.com/rollup/rollup/pull/4375): Fix typo in \_config.js (@eltociear)
- [#4376](https://github.com/rollup/rollup/pull/4376): refactor: fs.promises, move mkdir to writeoutputfile, Part 3 ( @dnalborczyk)
- [#4379](https://github.com/rollup/rollup/pull/4379): Deprecate hasModuleSideEffects in favor of moduleSideEffects and ensure it is mutable on ModuleInfo (@lukastaegert)

## 2.66.1

_2022-01-25_

### Bug Fixes

- Only warn for conflicting names in namespace reexports if it actually causes problems (#4363)
- Only allow explicit exports or reexports as synthetic namespaces and hide them from namespace reexports (#4364)

### Pull Requests

- [#4362](https://github.com/rollup/rollup/pull/4362): refactor: convert exportsByName object to map (@dnalborczyk)
- [#4363](https://github.com/rollup/rollup/pull/4363): Do not warn unnecessarily for namespace conflicts (@lukastaegert)
- [#4364](https://github.com/rollup/rollup/pull/4364): Do not expose synthetic namespace export in entries and namespaces (@lukastaegert)

## 2.66.0

_2022-01-22_

### Features

- Note if a module has a default export in ModuleInfo to allow writing better proxy modules (#4356)
- Add option to wait until all imported ids have been resolved when awaiting `this.load` (#4358)

### Pull Requests

- [#4356](https://github.com/rollup/rollup/pull/4356): Add hasDefaultExport to ModuleInfo (@lukastaegert)
- [#4358](https://github.com/rollup/rollup/pull/4358): Add "resolveDependencies" option to "this.load" (@lukastaegert)

## 2.65.0

_2022-01-21_

### Features

- Add complete import resolution objects to ModuleInfo for use in `this.load` (#4354)

### Bug Fixes

- Use correct context in plugin hooks with `perf: true` (#4357)

### Pull Requests

- [#4351](https://github.com/rollup/rollup/pull/4351): refactor: re-use source mapping url (@dnalborczyk)
- [#4352](https://github.com/rollup/rollup/pull/4352): refactor: replace require-relative with built-in require.resolve (@dnalborczyk)
- [#4353](https://github.com/rollup/rollup/pull/4353): chore: bump deps (@dnalborczyk)
- [#4354](https://github.com/rollup/rollup/pull/4354): Add importedIdResolutions to moduleInfo (@lukastaegert)
- [#4355](https://github.com/rollup/rollup/pull/4355): chore: remove external from config (@dnalborczyk)
- [#4357](https://github.com/rollup/rollup/pull/4357): fix: timed plugin context (@dnalborczyk)

## 2.64.0

_2022-01-14_

### Features

- Allow inspecting cached modules and forcing them to be transformed again via shouldTransformCachedModule (#4320)
- Do not wait for the config file to be parsed in watch mode if it is updated before that (#4344)

### Bug Fixes

- Do not mutate objects returned as `meta` from the resolveId hook (#4347)

### Pull Requests

- [#4326](https://github.com/rollup/rollup/pull/4326): refactor: type fixes (@dnalborczyk)
- [#4339](https://github.com/rollup/rollup/pull/4339): More watch test stabilization (@lukastaegert)
- [#4340](https://github.com/rollup/rollup/pull/4340): refactor: performance timers for node.js and browser ( @dnalborczyk)
- [#4341](https://github.com/rollup/rollup/pull/4341): Implement shouldTransformCachedModule hook (@lukastaegert)
- [#4344](https://github.com/rollup/rollup/pull/4344): Directly restart Rollup when config file change is detected in watch mode (@lukastaegert)
- [#4347](https://github.com/rollup/rollup/pull/4347): Create a shallow copy when returning meta from resolveId ( @lukastaegert)

## 2.63.0

_2022-01-04_

### Features

- Report a helpful error if rollup exits due to an empty event loop when using `this.load` (#4320)
- Allow directly mutating ModuleInfo.meta for modules and never replace this object (#4328)
- Detect additional side effect free array prototype methods (#4332)

### Bug Fixes

- Do not watch if CLI watch options are specified but `--watch` is missing (#4335)

### Pull Requests

- [#4320](https://github.com/rollup/rollup/pull/4320): Detect unfulfilled async hook actions and report error on exit ( @kzc)
- [#4328](https://github.com/rollup/rollup/pull/4328): Make initial ModuleInfo.meta mutable and maintain object identity (@lukastaegert)
- [#4318](https://github.com/rollup/rollup/pull/4318): Stabilize watch tests (@lukastaegert)
- [#4331](https://github.com/rollup/rollup/pull/4331): Improve JS docs example (@lukastaegert)
- [#4332](https://github.com/rollup/rollup/pull/4332): add support for Array.prototype.findLast,findLastIndex ( @dnalborczyk)
- [#4333](https://github.com/rollup/rollup/pull/4333): convert utils.transform to async function (@dnalborczyk)
- [#4335](https://github.com/rollup/rollup/pull/4335): Do not watch unless --watch is specified explicitly ( @lukastaegert)
- [#4338](https://github.com/rollup/rollup/pull/4338): Add build delay for plugin event test (@lukastaegert)

## 2.62.0

_2021-12-24_

### Features

- Mark additional string prototype methods as side-effect-free and correct typings of existing ones (#4299)
- Mark additional array prototype methods as side-effect-free and correct typings of existing ones (#4309)
- Expose if a module is included after tree-shaking in its ModuleInfo (#4305)

### Bug Fixes

- Fix how fsevents is included to improve watch mode on MacOS (#4312)

### Pull Requests

- [#4299](https://github.com/rollup/rollup/pull/4299): Add additional string prototype methods (@dnalborczyk)
- [#4300](https://github.com/rollup/rollup/pull/4300): Bump deps, fix expected test result for core-js (@dnalborczyk)
- [#4302](https://github.com/rollup/rollup/pull/4302): Replace type assertion with type guard (@dnalborczyk)
- [#4304](https://github.com/rollup/rollup/pull/4304): Re-use reserved names set (@dnalborczyk)
- [#4305](https://github.com/rollup/rollup/pull/4305): Expose isIncluded in module info (@william57m)
- [#4306](https://github.com/rollup/rollup/pull/4306): Fix git line breaks on windows (@dnalborczyk)
- [#4307](https://github.com/rollup/rollup/pull/4307): Add macos to pipeline (@dnalborczyk)
- [#4309](https://github.com/rollup/rollup/pull/4309): Add additional array prototype methods (@dnalborczyk)
- [#4311](https://github.com/rollup/rollup/pull/4311): Add Deno instructions to docs (@jespertheend)
- [#4312](https://github.com/rollup/rollup/pull/4312): fsevents integration (@dnalborczyk)
- [#4313](https://github.com/rollup/rollup/pull/4313): Remove non-existing static functions from known globals ( @dnalborczyk)

## 2.61.1

_2021-12-11_

### Bug Fixes

- Only resolve this.load once the code of the module is available (#4296)

### Pull Requests

- [#4296](https://github.com/rollup/rollup/pull/4296): Make sure this.load waits for modules that are already loading ( @lukastaegert)
- [#4298](https://github.com/rollup/rollup/pull/4298): use set for reserved words (@dnalborczyk)

## 2.61.0

_2021-12-09_

### Features

- Support ergonomic brand checks for private fields (#4293)

### Bug Fixes

- Improve handling of directory creation on systems with restrictive open files limit (#4288)

### Pull Requests

- [#4288](https://github.com/rollup/rollup/pull/4288): modifymkdirpath (@mgrabowski84)
- [#4293](https://github.com/rollup/rollup/pull/4293): bump deps (@dnalborczyk)

## 2.60.2

_2021-11-30_

### Bug Fixes

- Produce correct output when dynamic import paths contain quotes (#4286)

### Pull Requests

- [#4286](https://github.com/rollup/rollup/pull/4286): Escape dynamic import paths (@danielroe)

## 2.60.1

_2021-11-22_

### Bug Fixes

- Make sure virtual files have proper file extensions when preserving modules (#4270)

### Pull Requests

- [#4270](https://github.com/rollup/rollup/pull/4270): Use entryFileNames when generating filenames for virtual modules (@BPScott)

## 2.60.0

_2021-11-11_

### Features

- Add `this.load` context function to load, transform and parse modules without adding them to the graph (#4234)
- Sanitize non-url-safe characters in generated chunk names by default (#4262)
- Support ESM plugins via command line (#4265)

### Pull Requests

- [#4234](https://github.com/rollup/rollup/pull/4234): Plugin context function for pre-loading modules (@lukastaegert)
- [#4262](https://github.com/rollup/rollup/pull/4262): exclude invalid URL chars (@danielroe)
- [#4265](https://github.com/rollup/rollup/pull/4265): support loading ESM plugins from the CLI via --plugin (@kzc)

## 2.59.0

_2021-11-01_

### Features

- Support static class initialization blocks (#4249)

### Bug Fixes

- Fix an issue with the CommonJS plugin when module.exports has inherited properties (#4256)

### Pull Requests

- [#4236](https://github.com/rollup/rollup/pull/4236): typescript bug class field initialization order (@dnalborczyk)
- [#4249](https://github.com/rollup/rollup/pull/4249): Support for class static initialization block (@dnalborczyk and @lukastaegert)
- [#4256](https://github.com/rollup/rollup/pull/4256): Skip inherited properties in synthetic namespaces (@lukastaegert)

## 2.58.3

_2021-10-25_

### Bug Fixes

- Republish 2.58.1 with npm 6 as files were missing

## 2.58.2

_2021-10-25_

### Bug Fixes

- Republish 2.58.1 as files were missing

## 2.58.1

_2021-10-25_

### Bug Fixes

- Fix an issue with the CommonJS plugin when module.exports is falsy (#4247)

### Pull Requests

- [#4247](https://github.com/rollup/rollup/pull/4247): Handle falsy synthetic namespaces (@lukastaegert)

## 2.58.0

_2021-10-01_

### Features

- Add a flag to more reliably identify entry points in the `resolveId` hook (#4230)

### Pull Requests

- [#4230](https://github.com/rollup/rollup/pull/4230): Add isEntry flag to resolveId and this.resolve (@lukastaegert)
- [#4233](https://github.com/rollup/rollup/pull/4233): Remove unused rollup-plugin-typescript ambient module types ( @dnalborczyk)
- [#4235](https://github.com/rollup/rollup/pull/4235): Update dependencies (@lukastaegert)

## 2.57.0

_2021-09-22_

### Features

- Add `generatedCode` option to allow Rollup to use es2015 features for smaller output and more efficient helpers ( #4215)
- Improve AMD and SystemJS parsing performance by wrapping relevant functions in parentheses (#4215)
- Using `preferConst` will now show a warning with `strictDeprecations: true` (#4215)

### Bug Fixes

- Improve ES3 syntax compatibility by more consequently quoting reserved words as props in generated code (#4215)
- Do not use `Object.assign` in generated code to ensure ES5 compatibility without the need for polyfills (#4215)
- Support live-bindings in dynamic namespace objects that contain reexported external or synthetic namespaces (#4215)
- Use correct "this" binding in dynamic import expressions for CommonJS and AMD (#4215)
- Properly handle `shimMissingExports` for exports that are only used internally (#4215)
- Prevent unhandled rejection for failed module parsing (#4228)

### Pull Requests

- [#4212](https://github.com/rollup/rollup/pull/4212): chore: remove unused ambient types (@dnalborczyk)
- [#4215](https://github.com/rollup/rollup/pull/4215): Use ES2015 features in generated code snippets (@lukastaegert)
- [#4219](https://github.com/rollup/rollup/pull/4219): chore: bump rollup typescript, remove unused micromatch ( @dnalborczyk)
- [#4220](https://github.com/rollup/rollup/pull/4220): chore: use forceConsistentCasingInFileNames in ts-config ( @dnalborczyk)
- [#4224](https://github.com/rollup/rollup/pull/4224): prepare for useDefineForClassFields (@dnalborczyk)
- [#4228](https://github.com/rollup/rollup/pull/4228): fix: prevent UnhandledPromiseRejectionWarning when module resolution/parsing fails (@kherock)

## 2.56.3

_2021-08-23_

### Bug Fixes

- Make sure moduleInfo contains complete information about imported ids in the moduleParsed hook (#4208)

### Pull Requests

- [#4208](https://github.com/rollup/rollup/pull/4208): `ModuleInfo.importedIds` will return null if `resolvedIds[source]` is undefined (@FoxDaxian and @lukastaegert)

## 2.56.2

_2021-08-10_

### Bug Fixes

- Check if after simplification, an object pattern would become an expression statement or arrow function return value ( #4204)

### Pull Requests

- [#4204](https://github.com/rollup/rollup/pull/4204): Do not create invalid code when simplifying object pattern assignments (@lukastaegert)

## 2.56.1

_2021-08-08_

### Bug Fixes

- Fix rendering of SystemJS export declarations initialized with a simplifiable expression (#4202)

### Pull Requests

- [#4202](https://github.com/rollup/rollup/pull/4202): Fix incorrect rendering of export declarations in SystemJS ( @lukastaegert)

## 2.56.0

_2021-08-05_

### Features

- Create more efficient code for SystemJS exports (#4199)
- Extend `maxParallelFileReads` option to also throttle plugin load hooks (#4200)

### Bug Fixes

- Return correct value for postfix update expressions of exported variables (#4194)

### Pull Requests

- [#4199](https://github.com/rollup/rollup/pull/4199): Refine SystemJS export rendering (@lukastaegert)
- [#4200](https://github.com/rollup/rollup/pull/4200): Restrict parallel execution of load hook (@schummar)

## 2.55.1

_2021-07-29_

### Bug Fixes

- Improve CLI warning message for unused external imports (#4194)

### Pull Requests

- [#4194](https://github.com/rollup/rollup/pull/4194): Align batch warning for UNUSED_EXTERNAL_IMPORT to individual warning (@benmccann)

## 2.55.0

_2021-07-28_

### Features

- Support default export live-bindings when generating ESM output (#4182)

### Bug Fixes

- Always write `["default"]` as computed property when used as named export (#4182)
- Do not mask default export TDZ errors (#4182)

### Pull Requests

- [#4182](https://github.com/rollup/rollup/pull/4182): Use mutable bindings for default exports (@lukastaegert)

## 2.54.0

_2021-07-25_

### Features

- Extend UMD import.meta.url polyfill to support web workers (#4186)

### Bug Fixes

- Resolve an issue where certain uses of classes could lead to an infinite recursion (#4189)

### Pull Requests

- [#4186](https://github.com/rollup/rollup/pull/4186): Fix UMD import.meta.url inside web workers (@ceifa)
- [#4188](https://github.com/rollup/rollup/pull/4188): Fix typo in renderHelpers.ts (@eltociear)
- [#4189](https://github.com/rollup/rollup/pull/4189): Move long path recursion prevention to MemberExpression ( @lukastaegert)
- [#4190](https://github.com/rollup/rollup/pull/4190): Stop recommending node-builtins (@curran)

## 2.53.3

_2021-07-21_

### Bug Fixes

- Solve an issue that could lead to severe memory issues and crashes when there are a lot of hoisted variables (#4183)

### Pull Requests

- [#4183](https://github.com/rollup/rollup/pull/4183): Avoid memory issues with hoisted variables (@lukastaegert)

## 2.53.2

_2021-07-15_

### Bug Fixes

- Identify additional TDZ situations in functions that are run more than once (#4177)
- Fix a scoping issue when a variable inside a catch scope matches the scope parameter's name (#4178)

### Pull Requests

- [#4177](https://github.com/rollup/rollup/pull/4177): Fix additional let/var init bugs (@kzc)
- [#4178](https://github.com/rollup/rollup/pull/4178): Correctly create outside variable when shadowed by catch parameter (@lukastaegert)

## 2.53.1

_2021-07-11_

### Bug Fixes

- Do not omit namespace reexports when `treeshake` is `false` (#4175)

### Pull Requests

- [#4175](https://github.com/rollup/rollup/pull/4175): Generate namespace objects when not tree-shaking (@lukastaegert)

## 2.53.0

_2021-07-09_

### Features

- Add `maxParallelFileReads` option to limit read operations with a default of 20 (#4170)

### Pull Requests

- [#4170](https://github.com/rollup/rollup/pull/4170): Limit parallel file reads to prevent "EMFILE: too many open files" error (@schummar)

## 2.52.8

_2021-07-07_

### Bug Fixes

- Automatically handle many use `var` before declaration and TDZ access scenarios correctly without the need for `treeshake.correctVarValueBeforeDeclaration` (#4148)

### Pull Requests

- [#4148](https://github.com/rollup/rollup/pull/4148): Fix var/const/let variable use before declaration (@kzc and @lukastaegert)

## 2.52.7

_2021-07-02_

### Bug Fixes

- Fix an issue where reassignments where not tracked through async function returns (#4163)

### Pull Requests

- [#4163](https://github.com/rollup/rollup/pull/4163): Deoptimize return values of async functions (@lukastaegert)

## 2.52.6

_2021-07-01_

### Bug Fixes

- Fix an issue where reassignments where not tracked through an await expression (#4162)

### Pull Requests

- [#4162](https://github.com/rollup/rollup/pull/4162): doptimize awaited expressions (@lukastaegert)

## 2.52.5

_2021-07-01_

### Bug Fixes

- Properly display parser errors not tied to a code location (#4160)

### Pull Requests

- [#4160](https://github.com/rollup/rollup/pull/4160): fix: max stack call error is caught on locate (@semoal)

## 2.52.4

_2021-06-30_

### Bug Fixes

- Fix an error when external namespaces are reexported across several files (#4159)

### Pull Requests

- [#4159](https://github.com/rollup/rollup/pull/4159): Properly handle double reexports from external namespaces ( @lukastaegert)

## 2.52.3

_2021-06-25_

### Bug Fixes

- Fix an issue where code was wrongly removed when using vars in nested scopes (#4149)

### Pull Requests

- [#4149](https://github.com/rollup/rollup/pull/4149): Make sure the initializer of hoisted variables is deoptimized ( @lukastaegert)

## 2.52.2

_2021-06-21_

### Bug Fixes

- Support falsy plugins in types (#4144)
- Do not require return value in renderChunkHook type (#4144)

### Pull Requests

- [#4144](https://github.com/rollup/rollup/pull/4144): Use TypeScript config and improve some types (@lukastaegert)

## 2.52.1

_2021-06-17_

### Bug Fixes

- Fix a memory leak in watch mode (#4142)

### Pull Requests

- [#4142](https://github.com/rollup/rollup/pull/4142): Make array and object prototype singletons immutable for now ( @lukastaegert)

## 2.52.0

_2021-06-16_

### Features

- Add `--configPlugin` CLI option to apply plugins to the config file for e.g. TypeScript configs (#3835)
- Add "safest" and "smallest" presets to tree-shaking options for easier configuration (#4131)
- Add `treeshake.correctVarValueBeforeDeclaration` option to deoptimize `var` declarations (#4139)

### Pull Requests

- [#3835](https://github.com/rollup/rollup/pull/3835): Add typescript config support (@TheRealSyler)
- [#4131](https://github.com/rollup/rollup/pull/4131): Add presets to the tree-shaking options (@lukastaegert)
- [#4139](https://github.com/rollup/rollup/pull/4139): Add option to deoptimize var declarations for tree-shaking ( @lukastaegert)
- [#4141](https://github.com/rollup/rollup/pull/4141): Update dependencies (@lukastaegert)

## 2.51.2

_2021-06-11_

### Bug Fixes

- Include modules imported from no-treeshake modules even if they would be empty (#4138)

### Pull Requests

- [#4138](https://github.com/rollup/rollup/pull/4138): Include all dependencies from modules with no-treeshake ( @lukastaegert)

## 2.51.1

_2021-06-08_

### Bug Fixes

- Fix error when using `defineConfig` (#4134)

### Pull Requests

- [#4134](https://github.com/rollup/rollup/pull/4134): export `rollup.defineConfig` at runtime (@mshrtsr)

## 2.51.0

_2021-06-06_

### Features

- Add a helper for IntelliSense support in config files (#4127)

### Bug Fixes

- Improve performance when generating source maps (#4122)

### Pull Requests

- [#4122](https://github.com/rollup/rollup/pull/4122): User Map to optimize performance (@izevo)
- [#4127](https://github.com/rollup/rollup/pull/4127): Export defineConfig defines the auxiliary function of the configuration (@rxliuli)

## 2.50.6

_2021-06-03_

### Bug Fixes

- Do not consider the object spread operator as side effect when `propertyReadSideEffects` are false (#4119)
- Detect side effects when returning thenables from async arrow functions (#4120)

### Pull Requests

- [#4119](https://github.com/rollup/rollup/pull/4119): Respect propertyReadSideEffects in spread elements ( @lukastaegert)
- [#4120](https://github.com/rollup/rollup/pull/4120): Detect async arrow thenable side effects (@lukastaegert)

## 2.50.5

_2021-05-30_

### Bug Fixes

- Detect side effects when accessing thenables (#4115)

### Pull Requests

- [#4114](https://github.com/rollup/rollup/pull/4114): use `colorette` instead of `turbocolor` (@ryuever)
- [#4115](https://github.com/rollup/rollup/pull/4115): Tracks side effects of thenables (@lukastaegert)

## 2.50.4

_2021-05-29_

### Bug Fixes

- Fix a situation where tree-shaking would stop including nodes prematurely (#4111)
- Track mutations and accessor side effects when using `__proto__` in an object literal (#4112)
- Check for getter effects when spreading an object (#4113)

### Pull Requests

- [#4111](https://github.com/rollup/rollup/pull/4111): Always request a new tree-shaking pass when deoptimizations of a node are first included (@lukastaegert)
- [#4112](https://github.com/rollup/rollup/pull/4112): Actually set the prototype when using a **proto** property ( @lukastaegert)
- [#4113](https://github.com/rollup/rollup/pull/4113): Track access side effects when using object spread operator ( @lukastaegert)

## 2.50.3

_2021-05-28_

### Bug Fixes

- Wrap parentheses around leading elements in simplified sequence expressions if this would otherwise lead to invalid code (#4110)
- Do not associate block soped variables in catch clauses with the clause parameter (#4108)
- Do not associate hoisted variables in catch clauses with outside variables if they match the parameter (#4108)
- Use correct "this" context for tagged template literal member expressions in simplified sequences (#4110)

### Pull Requests

- [#4108](https://github.com/rollup/rollup/pull/4108): Correctly handle catch declarations (@lukastaegert)
- [#4110](https://github.com/rollup/rollup/pull/4110): Invalid sequence expression simplification (@lukastaegert)

## 2.50.2

_2021-05-27_

### Bug Fixes

- Avoid unnecessary side effects when using methods like `.filter` and `.map` (#4103)
- Avoid crash when a module with moduleSideEffects no-treeshake imports a tree-shaken module (#4104)

### Pull Requests

- [#4103](https://github.com/rollup/rollup/pull/4103): Do not track side-effect-free array methods as side effects ( @lukastaegert)
- [#4104](https://github.com/rollup/rollup/pull/4104): Fix crash when using inlineDynamicImports with no-treeshake ( @lukastaegert)

## 2.50.1

_2021-05-26_

### Bug Fixes

- Do not associate pure annotations in simplified expressions with wrong elements (#4095)
- Prevent invalid code when simplified conditionals start with an IIFE function expression (#4099)

### Pull Requests

- [#4095](https://github.com/rollup/rollup/pull/4095): Correctly associate pure annotations and remove invalid ones ( @lukastaegert)
- [#4099](https://github.com/rollup/rollup/pull/4099): Wrap leading function expression iifes in conditionals ( @lukastaegert)

## 2.50.0

_2021-05-25_

### Features

- Only include last elements of comma expressions if they are used or have side effects (#4087)

### Bug Fixes

- Prevent a crash that could occur when calling object methods (#4091)

### Pull Requests

- [#4085](https://github.com/rollup/rollup/pull/4085): Switch to ESLint (@lukastaegert)
- [#4087](https://github.com/rollup/rollup/pull/4087): Drop unused last sequence element (@lukastaegert)
- [#4091](https://github.com/rollup/rollup/pull/4091): Prevent crash for recursive "this" deoptimization (@lukastaegert)

## 2.49.0

_2021-05-23_

### Features

- Detect side-effect-free static class methods and properties (#4018)
- Detect side-effect-free array elements (#4018)
- Do not apply deoptimizations from dead code (#4018)

### Bug Fixes

- Handle side effect detection for getters and setters added in untracked code (#4018)
- Track "this" mutations for methods, getters and setters (#4018)

### Pull Requests

- [#4018](https://github.com/rollup/rollup/pull/4018): Class method effects (@marijnh and @lukastaegert)

## 2.48.0

_2021-05-15_

### Features

- Add replacement to conditionally insert asset extensions in `entryFileNames` when preserving modules (#4077)

### Bug Fixes

- Fix crash when dynamically assigning to namespace members (#4070)
- Do not associate pure annotations in front of a semi-colon or comma with succeeding code (#4068)

### Pull Requests

- [#4068](https://github.com/rollup/rollup/pull/4068): ignore invalid trailing pure annotations (@kzc)
- [#4070](https://github.com/rollup/rollup/pull/4070): undefined `deoptimizePath` when the first element is empty string (@si3nloong)
- [#4071](https://github.com/rollup/rollup/pull/4071): add node.js v16 support (@dnalborczyk)
- [#4077](https://github.com/rollup/rollup/pull/4077): Add assetExtname replacement in entryFileNames (@BPScott)
- [#4080](https://github.com/rollup/rollup/pull/4080): Added Rollup logo in README.md (@priyanshurav)
- [#4081](https://github.com/rollup/rollup/pull/4081): fix comment regarding invalid annotation handling (@kzc)

## 2.47.0

_2021-05-04_

### Features

- Warn about ambiguous imports from combined external namespace reexports (#4064)
- In case of combined namespace reexports, always prefer local exports over external namespaces (#4064)
- Treat conflicting names in local namespace reexports as undefined (#4064)

### Pull Requests

- [#4064](https://github.com/rollup/rollup/pull/4064): Prefer locally defined exports and reexports over external namespaces (@lukastaegert)

## 2.46.0

_2021-04-29_

### Features

- Add option to disable file name sanitation (#4058)
- Add information about importers to unused external import warning (#4054)

### Pull Requests

- [#4042](https://github.com/rollup/rollup/pull/4042): Use Github actions only (@lukastaegert)
- [#4045](https://github.com/rollup/rollup/pull/4045): Fix REPL artefact branch reference (@lukastaegert)
- [#4046](https://github.com/rollup/rollup/pull/4046): Use codecov action for coverage (@lukastaegert)
- [#4054](https://github.com/rollup/rollup/pull/4054): Add to `UNUSED_EXTERNAL_IMPORT` warning information about the origin of the problem (@cawa-93)
- [#4058](https://github.com/rollup/rollup/pull/4058): Add sanitizeFileName option (@guybedford)

## 2.45.2

_2021-04-13_

### Bug Fixes

- Do not user a dynamic entry file name for naming a manual chunk (#4040)

### Pull Requests

- [#4040](https://github.com/rollup/rollup/pull/4040): Prioritize manual chunk name over dynamic entry id ( @lukastaegert)

## 2.45.1

_2021-04-10_

### Bug Fixes

- Handle falsy return values from async plugin options hooks (#4039)

### Pull Requests

- [#4039](https://github.com/rollup/rollup/pull/4039): Do not fail when returning null or undefined from an async options hook (@lukastaegert)

## 2.45.0

_2021-04-09_

### Features

- Support private class instance methods and accessors (#4034)

### Pull Requests

- [#4034](https://github.com/rollup/rollup/pull/4034): feat: add support for private class methods (@dnalborczyk)

## 2.44.0

_2021-03-29_

### Features

- Add a new option `makeAbsoluteExternalsRelative` to opt out of renormalizing absolute external ids to relative ids ( #4021)
- Extend the `resolveId` plugin hook to allow forcing or preventing renormalization of absolute external ids (#4021)
- Make the rendered code of individual modules available in the generated bundle (#4028)

### Bug Fixes

- Handle objects with `__proto__` properties correctly (#4019)

### Pull Requests

- [#4019](https://github.com/rollup/rollup/pull/4019): Deoptimize ObjectExpression when a `__proto__` property is present (@marijnh)
- [#4021](https://github.com/rollup/rollup/pull/4021): Improve absolute path handling (@lukastaegert)
- [#4026](https://github.com/rollup/rollup/pull/4026): chore: fix vscode launch config (change tdd to bdd) (@jameslahm)
- [#4027](https://github.com/rollup/rollup/pull/4027): Post comment for PRs from forks (@lukastaegert)
- [#4028](https://github.com/rollup/rollup/pull/4028): Expose rendered module code to generateBundle hook (@btd)

## 2.43.1

_2021-03-28_

### Bug Fixes

- Prevent infinite recursions in certain scenarios when calling object properties (#4025)

### Pull Requests

- [#4025](https://github.com/rollup/rollup/pull/4025): Handle recursive this mutation detection (@lukastaegert)

## 2.43.0

_2021-03-27_

### Features

- Track side effects of function properties in objects for better tree-shaking (#4011)

### Pull Requests

- [#4011](https://github.com/rollup/rollup/pull/4011): Disable pessimistic object deoptimization for calls when the called function doesn't ref this (@marijnh)
- [#4012](https://github.com/rollup/rollup/pull/4012): fix `sourcemap` reference in docs (@tjenkinson)
- [#4015](https://github.com/rollup/rollup/pull/4015): Use SIGTERM instead of SIGINT to kill test child processes in tests (@marijnh)

## 2.42.4

_2021-03-24_

### Bug Fixes

- Do not discard plugin return values when using perf option (#4010)

### Pull Requests

- [#4010](https://github.com/rollup/rollup/pull/4010): Return hook result inside promise with async timer end ( @SuperOleg39)

## 2.42.3

_2021-03-22_

### Bug Fixes

- Do not ignore `#__PURE__` comments in front of optional chaining expressions (#4007)

### Pull Requests

- [#4007](https://github.com/rollup/rollup/pull/4007): Tree-shake pure call expressions with optional chaining ( @lukastaegert)

## 2.42.2

_2021-03-22_

### Bug Fixes

- Use correct import.meta.url in relative imports from transpiled config files (#4005)

### Pull Requests

- [#4005](https://github.com/rollup/rollup/pull/4005): Use correct import.meta.url in config files (@lukastaegert)

## 2.42.1

_2021-03-20_

### Bug Fixes

- Do not produce unhandled Promise rejections when plugins throw while using the `perf` option (#4004)

### Pull Requests

- [#4004](https://github.com/rollup/rollup/pull/4004): Fixed unhandled promise rejections (@gluck)

## 2.42.0

_2021-03-19_

### Features

- Prevent infinite loops when several plugins are using `this.resolve` in their resolveId hook (#4000)

### Pull Requests

- [#4000](https://github.com/rollup/rollup/pull/4000): Break infinite loops in this.resolve (@lukastaegert)

## 2.41.5

_2021-03-18_

### Bug Fixes

- Make sure unused property accesses of external namespaces can be tree-shaken (#4001)

### Pull Requests

- [#4001](https://github.com/rollup/rollup/pull/4001): Do not count accessing members of an external namespace as side-effects (@lukastaegert)

## 2.41.4

_2021-03-16_

### Bug Fixes

- Do not replace external namespace imports with individual named imports to avoid changing behaviour with regard to missing exports (#3999)

### Pull Requests

- [#3999](https://github.com/rollup/rollup/pull/3999): Allow to safely probe external namespaces (@lukastaegert)

## 2.41.3

_2021-03-16_

### Bug Fixes

- Always retain arguments passed to empty object pattern parameters (#3998)

### Pull Requests

- [#3998](https://github.com/rollup/rollup/pull/3998): Do not create invalid code if a function argument is an empty object pattern (@lukastaegert)

## 2.41.3

_2021-03-16_

### Bug Fixes

- Always retain arguments passed to empty object pattern parameters (#3998)

### Pull Requests

- [#3998](https://github.com/rollup/rollup/pull/3998): Do not create invalid code if a function argument is an empty object pattern (@lukastaegert)

## 2.41.2

_2021-03-12_

### Bug Fixes

- Also remove sourcemaps comments if plugins return a pre-made ast (#3987)

### Pull Requests

- [#3987](https://github.com/rollup/rollup/pull/3987): Change removal of sourcemap comment (@yannayl)

## 2.41.1

_2021-03-11_

### Pull Requests

- [#3990](https://github.com/rollup/rollup/pull/3990): Add browser sourcemap and remove log (@lukastaegert)

## 2.41.0

_2021-03-09_

### Features

- Add option to `treeshake.propertyReadSideEffects` to keep all property accesses (#3985)

### Bug Fixes

- Also respect pure comment annotations when a plugin provides an AST in the transform hook provided they use this.parse (#3981)

### Pull Requests

- [#3981](https://github.com/rollup/rollup/pull/3981): Move pure comment annotation to Graph.contextParse (@yannayl)
- [#3985](https://github.com/rollup/rollup/pull/3985): implement --treeshake.propertyReadSideEffects=always to handle getters with side effects (@kzc)

## 2.40.0

_2021-02-26_

### Features

- Make sure that entry point variable names take precedence over variable names in dependencies when deconflicting ( #3977)

### Bug Fixes

- Replace `:` in generated file names to prevent invalid files on Windows (#3972)

### Pull Requests

- [#3972](https://github.com/rollup/rollup/pull/3972): Don't allow `:` in file names (@lukastaegert)
- [#3976](https://github.com/rollup/rollup/pull/3976): Add soft breaks to guide to improve mobile experience ( @lukastaegert)
- [#3977](https://github.com/rollup/rollup/pull/3977): Reverse module deconflicting order (@lukastaegert)

## 2.39.1

_2021-02-23_

### Bug Fixes

- Make sure local variables named Symbol, Object or Promise do not conflict with code generated by Rollup (#3971)

### Pull Requests

- [#3964](https://github.com/rollup/rollup/pull/3964): Remove extra word (@jamonholmgren)
- [#3971](https://github.com/rollup/rollup/pull/3971): Avoid conflicts with local variables named Symbol, Object, Promise (@lukastaegert)

## 2.39.0

_2021-02-12_

### Features

- Add "validate" option to verify generated chunks are valid JavaScript (#3952)

### Bug Fixes

- Always add exports properties for uninitialized named exports (#3957)
- Allow using an external namespace reexport together with named exports (#3959)
- Avoid invalid generated code in certain scenarios with SystemJS exports (#3960)

### Pull Requests

- [#3952](https://github.com/rollup/rollup/pull/3952): implement `validate` output option and `--validate` CLI option ( @kzc)
- [#3956](https://github.com/rollup/rollup/pull/3956): Update dependencies, fix fsevents issue (@lukastaegert)
- [#3957](https://github.com/rollup/rollup/pull/3957): Make sure uninitialised exports turn up via .hasOwnProperty for non-ES formats (@lukastaegert)
- [#3959](https://github.com/rollup/rollup/pull/3959): Allow overriding individual exports of reexported external namespaces (@lukastaegert)
- [#3960](https://github.com/rollup/rollup/pull/3960): Make sure system exports are valid JavaScript (@lukastaegert)

## 2.38.5

_2021-02-05_

### Bug Fixes

- Prevent invalid code when simplifying assignments and delcarations (#3951)
- Prevent behaviour-changing line-breaks when simplifying assignments in return statements (#3951)
- Slightly improve white-space rendering when simplifying certain expressions (#3951)

### Pull Requests

- [#3951](https://github.com/rollup/rollup/pull/3951): Wrap simplified assignments if necessary (@lukastaegert)

## 2.38.4

_2021-02-02_

### Bug Fixes

- Do not change logic when tree-shaking declarations in if statements or loops (#3947)

### Pull Requests

- [#3947](https://github.com/rollup/rollup/pull/3947): Do not tear apart declarations in loop or if bodies ( @lukastaegert)

## 2.38.3

_2021-02-01_

### Bug Fixes

- Prevent an unexpected live-binding when default exporting a synthetic named export (#3946)

### Pull Requests

- [#3945](https://github.com/rollup/rollup/pull/3945): Upgrade chokidar and fsevents for Apple M1 compatibility ( @threepointone)
- [#3946](https://github.com/rollup/rollup/pull/3946): Make sure default exports snapshot synthetic named exports ( @lukastaegert)

## 2.38.2

_2021-01-31_

### Bug Fixes

- Do not generate invalid code for partially tree-shaken declarations in for loops (#3943)
- Always include function bodies of functions in side-effect-free modules (#3944)

### Pull Requests

- [#3943](https://github.com/rollup/rollup/pull/3943): Do not partially tree-shake unused declarations in for loops ( @lukastaegert)
- [#3944](https://github.com/rollup/rollup/pull/3944): Correctly include functions with side effects from side-effect-free modules (@lukastaegert)

## 2.38.1

_2021-01-28_

### Bug Fixes

- Fix internal error when resolving a missing entry point in the browser build (#3935)

### Pull Requests

- [#3935](https://github.com/rollup/rollup/pull/3935): fix: remove isolated resolve() for compat with browser distribution (@cmorten and @lukastaegert)
- [#3936](https://github.com/rollup/rollup/pull/3936): Ensure test after() callback is always executed ( @Benjamin-Dobell)
- [#3937](https://github.com/rollup/rollup/pull/3937): Modernize references to other software (@ludofischer)

## 2.38.0

_2021-01-22_

### Features

- Entirely remove declared variables that only have an initializer side effect (#3933)

### Pull Requests

- [#3933](https://github.com/rollup/rollup/pull/3933): Tree-shake unused declarations while keeping initializer side-effects (@lukastaegert)

## 2.37.1

_2021-01-20_

### Pull Requests

- [#3929](https://github.com/rollup/rollup/pull/3929): Deduplicate acorn import (@lukastaegert)

## 2.37.0

_2021-01-19_

### Features

- Always check modules for side effects that only indirectly reexport a used variable (#3840)
- Warn if a circular dependency would cause wrong execution order when preserving modules (#3840)

### Bug Fixes

- Allow consuming synthetic exports via modules that reexport a namespace (#3894)
- Do not crash for circular default reexports (#3840)
- Do not crash for circular synthetic namespaces (#3840)
- Improve circular dependency execution order in certain scenarios (#3840)

### Pull Requests

- [#3840](https://github.com/rollup/rollup/pull/3840): Improve circular dependency execution order (@lukastaegert)
- [#3894](https://github.com/rollup/rollup/pull/3894): Always respect synthetic namespaces in namespace reexport ( @lukastaegert)

## 2.36.2

_2021-01-16_

### Bug Fixes

- Fix an issue where invalid code was generated for unused assignments with side effects (#3926)

### Pull Requests

- [#3926](https://github.com/rollup/rollup/pull/3926): Correctly simplify assignments with parentheses (@lukastaegert)

## 2.36.1

_2021-01-06_

### Bug Fixes

- Solve issues that result in invalid code when partially removing assignments (#3921)

### Pull Requests

- [#3921](https://github.com/rollup/rollup/pull/3921): Prevent invalid code when removing assignment target of side-effectful object expression (@lukastaegert)

## 2.36.0

_2021-01-05_

### Features

- Support partial tree-shaking of chained assignments and unused assignment targets (#3919)

### Pull Requests

- [#3919](https://github.com/rollup/rollup/pull/3919): Treeshake chained assignment expressions (@lukastaegert)

## 2.35.1

_2020-12-14_

### Bug Fixes

- Allow closing the bundle when watching in case of generate errors by adding the bundle to the error event (#3909)
- Automatically close all bundles on generate errors when watching and using the CLI (#3909)
- Try to create remaining bundles when watching and one of them throws (#3909)

### Pull Requests

- [#3909](https://github.com/rollup/rollup/pull/3909): Forward bundle through watch error events (@lukastaegert)

## 2.35.0

_2020-12-14_

### Features

- Add `closeBundle` hook that is triggered by `bundle.close()` in the JS API (#3883)

### Pull Requests

- [#3883](https://github.com/rollup/rollup/pull/3883): Revert pattern to folder export (@intrnl)

## 2.34.2

_2020-12-06_

### Bug Fixes

- Revert pattern export change (#3898)

### Pull Requests

- [#3898](https://github.com/rollup/rollup/pull/3898): Revert pattern to folder export (@lukastaegert)

## 2.34.1

_2020-12-03_

### Bug Fixes

- Avoid Node deprecation warning by using a pattern export for nested Rollup files (#3896)

### Pull Requests

- [#3887](https://github.com/rollup/rollup/pull/3887): Run memory leak test on all systems (@lukastaegert)
- [#3892](https://github.com/rollup/rollup/pull/3892): Add pull_request to windows github actions (@shellscape)
- [#3893](https://github.com/rollup/rollup/pull/3893): Update dependencies (@lukastaegert)
- [#3896](https://github.com/rollup/rollup/pull/3896): Replace deprecated folder package export with pattern export ( @lukastaegert)

## 2.34.0

_2020-11-29_

### Features

- Support RequireJS comaptible AMD ids in code-splitting builds via amd.autoId (#3867)
- Allow adding an AMD id base path (#3867)

### Bug Fixes

- Warn when using an constant AMD id in a code-splitting build (#3867)

### Pull Requests

- [#3867](https://github.com/rollup/rollup/pull/3867): Implement amd.autoId/amd.basePath options (@tjenkinson)

## 2.33.3

_2020-11-18_

### Bug Fixes

- Do not use `.js` extension when importing AMD files from a UMD bundle (#3872)

### Pull Requests

- [#3861](https://github.com/rollup/rollup/pull/3861): Update chat/support links (@shellscape)
- [#3872](https://github.com/rollup/rollup/pull/3872): Also removeExtensionFromRelativeAmdId in UMD finaliser ( @tjenkinson)

## 2.33.2

_2020-11-14_

### Bug Fixes

- Fix an issue where statements were ignored after a conditional return in a labeled statement (#3871)

### Pull Requests

- [#3871](https://github.com/rollup/rollup/pull/3871): Correctly track label usage in try statements (@Amareis)

## 2.33.1

_2020-11-02_

### Bug Fixes

- Add `syntheticNamedExports` to `this.getModuleInfo` to align with documentation (#3847)

### Pull Requests

- [#3847](https://github.com/rollup/rollup/pull/3847): Expose syntheticNamedExports to ModuleInfo (@Amareis)
- [#3852](https://github.com/rollup/rollup/pull/3852): Fix typo on docs (@jpsc)

## 2.33.0

_2020-11-01_

### Features

- Add parameter to "watchChange" hook to denote if a change was an addition, update or deletion (#3841)
- Add "closeWatcher" hook to allow plugins to clean up resources when the watcher is closed (#3841)
- Add "this.getWatchFiles" function to plugin context to get the current set of watched files (#3841)

### Pull Requests

- [#3841](https://github.com/rollup/rollup/pull/3841): Improved watcher hooks (@Amareis)
- [#3848](https://github.com/rollup/rollup/pull/3848): Add options hook to asyncpluginhooks (@intrnl)

## 2.32.1

_2020-10-21_

### Bug Fixes

- Print warning location for plugin warnings if only `loc` is supplied (#3824)

### Pull Requests

- [#3824](https://github.com/rollup/rollup/pull/3824): plugin warnings not showing warning.loc (@luciotato)

## 2.32.0

_2020-10-16_

### Features

- Extend `preserveEntrySignatures` with a value `"exports-only"` to allow extension only if an entry does not have exports (#3823)

### Pull Requests

- [#3823](https://github.com/rollup/rollup/pull/3823): Add "exports-only" option to preserveSignature (@lukastaegert)

## 2.31.0

_2020-10-15_

### Features

- When using the `output.moduleToStringTag` option, also add the tag to entries with exports and simulated external namespaces (#3822)
- Add the `__esModule` interop marker to IIFE global variables unless `output.esModule` is turned off (#3822)

### Pull Requests

- [#3822](https://github.com/rollup/rollup/pull/3822): Add module toStringTag to entries and interop namespaces ( @lukastaegert)

## 2.30.0

_2020-10-13_

### Features

- Add `moduleParsed` hook that is called for each module once code and AST are available (#3813)
- Include code and AST in `this.getModuleInfo` (#3813)

### Bug Fixes

- Provide the original Acorn AST instead of the internal one when resolving dynamic imports that contain non-trivial expressions (#3813)

### Pull Requests

- [#3813](https://github.com/rollup/rollup/pull/3813): Add moduleParsed plugin hook (@lukastaegert)
- [#3815](https://github.com/rollup/rollup/pull/3815): Docs: wile => while (@tjenkinson)
- [#3817](https://github.com/rollup/rollup/pull/3817): Docs: fix code snippet (@codefrau)
- [#3818](https://github.com/rollup/rollup/pull/3818): Update documentation on configuring Babel, removing the section on passing '{"modules": false}' as that is no longer needed since Babel 7 (@Robin-Hoodie)

## 2.29.0

_2020-10-08_

### Features

- Allow passing custom options to other plugins via `this.resolve` (#3807)
- Allow attaching custom meta information to modules when resolving, loading or transforming (#3807)
- Do not throw but return `null` when using `this.getModuleInfo` for an unknown id (#3807)

### Bug Fixes

- Trigger build in watch mode when files are added to a watched directory (#3812)
- Make `code` optional when transforming modules (#3807)

### Pull Requests

- [#3807](https://github.com/rollup/rollup/pull/3807): Implement new APIs for inter-plugin communication (@lukastaegert)
- [#3808](https://github.com/rollup/rollup/pull/3808): Document that the default value of --format is 'es' ( @jameshfisher)
- [#3812](https://github.com/rollup/rollup/pull/3812): Watch: listen for new files added to a directory (@dmitrage)

## 2.28.2

_2020-09-24_

### Bug Fixes

- Fix a source of possible variable name conflicts when using preserveModules with SystemJS (#3796)

### Pull Requests

- [#3792](https://github.com/rollup/rollup/pull/3792): add documentation for output.PreserveModulesRoot (@davidroeca)
- [#3796](https://github.com/rollup/rollup/pull/3796): Fix SystemJS default variable conflict (@lukastaegert)

## 2.28.1

_2020-09-21_

### Bug Fixes

- Fix a path slash issue when using the preserveModulesRoot option on Windows (#3791)

### Pull Requests

- [#3791](https://github.com/rollup/rollup/pull/3791): Fix preserveModulesRoot path on Windows (@lukastaegert)

## 2.28.0

_2020-09-21_

### Features

- Add an option to treat modules at a given path as located at root when preserving modules (#3786)

### Pull Requests

- [#3786](https://github.com/rollup/rollup/pull/3786): Add preserveModulesRoot config option (@davidroeca)

## 2.27.1

_2020-09-17_

### Bug Fixes

- Do not fail when using ES module imports in symlinked config files (#3783)

### Pull Requests

- [#3783](https://github.com/rollup/rollup/pull/3783): Handle loading symlinked config files (@lukastaegert)

## 2.27.0

_2020-09-16_

### Features

- Support specifying a file extension when reading from stdin (#3775)

### Bug Fixes

- Do not break logic if a branch with hoisted variables is tree-shaken in an else-if statement (#3782)

### Pull Requests

- [#3770](https://github.com/rollup/rollup/pull/3770): Docs: Exception for babel plugin and commonjs plugin (@jsk7)
- [#3775](https://github.com/rollup/rollup/pull/3775): add ability to specify stdin file extension via --stdin=ext ( @kzc)
- [#3782](https://github.com/rollup/rollup/pull/3782): Handle hoisted variables in dead branches of nested if statements (@lukastaegert)

## 2.26.11

_2020-09-08_

### Bug Fixes

- Do not fail for unknown nodes as if statement branches (#3769)

### Pull Requests

- [#3769](https://github.com/rollup/rollup/pull/3769): Handle debugger statements as if-statement branches ( @lukastaegert)

## 2.26.10

_2020-09-04_

### Bug Fixes

- Do not create invalid code when simplifying expressions in return statements that contain line comments (#3762)

### Pull Requests

- [#3757](https://github.com/rollup/rollup/pull/3757): Fix api docs loadconfigfile (@maxwell8888)
- [#3762](https://github.com/rollup/rollup/pull/3762): Handle line-comments when removing line-breaks to prevent ASI ( @lukastaegert)

## 2.26.9

_2020-09-01_

### Bug Fixes

- Add regular expression support to watch include/exclude types (#3754)

### Pull Requests

- [#3754](https://github.com/rollup/rollup/pull/3754): Add RegExp to the include and exclude fields of the WatcherOptions type (@dagda1)
- [#3756](https://github.com/rollup/rollup/pull/3756): Update FAQ: I think it was meant "external" instead of " other-entry.js" (@madacol)

## 2.26.8

_2020-08-29_

### Bug Fixes

- Make sure that both unresolved and resolved ids are passed to the `external` option in all cases (#3753)

### Pull Requests

- [#3753](https://github.com/rollup/rollup/pull/3753): Also pass resolved ids to external if they use the object for ( @lukastaegert)

## 2.26.7

_2020-08-28_

### Bug Fixes

- Avoid invalid code when rendering hoisted variable declarations from dead branches (#3752)
- Mark the `options` parameter of `this.parse` as optional for TypeScript plugins (#3750)

### Pull Requests

- [#3750](https://github.com/rollup/rollup/pull/3750): Make `options` of `PluginContext#parse` optional (@intrnl)
- [#3752](https://github.com/rollup/rollup/pull/3752): Extract hoisted variables from dead branches (@lukastaegert)

## 2.26.6

_2020-08-27_

### Bug Fixes

- Avoid conflicts between the namespace of synthetic named exports and local variables (#3747)

### Pull Requests

- [#3747](https://github.com/rollup/rollup/pull/3747): Properly deconflict synthetic named exports (@lukastaegert)

## 2.26.5

_2020-08-22_

### Bug Fixes

- Use correctly deconflicted variable names for reexported namespaces in ES formats (#3742)

### Pull Requests

- [#3742](https://github.com/rollup/rollup/pull/3742): Avoid variable name conflict when reexporting several namespaces from a chunk (@lukastaegert)

## 2.26.4

_2020-08-19_

### Bug Fixes

- Fix a situation where invalid code was rendered when dynamically importing a module with synthetic named exports when preserving modules (#3738)
- Create a proper namespace object when in a non-es format, a namespace is imported from a chunk with `default` export mode (#3738)
- Use the same variable when in a chunk, a namespace is both imported and reexported as a binding (#3738)
- Do not include the synthetic namespace in static entry points unless it is actually used (#3738)
- Make sure the chunking of one output does not interfere with the namespace objects of another output (#3738)

### Pull Requests

- [#3738](https://github.com/rollup/rollup/pull/3738): Improve synthetic entry handling (@lukastaegert)

## 2.26.3

_2020-08-16_

### Bug Fixes

- Fix a situation where line-breaks in a nested simplified conditional expression could result in broken code (#3734)

### Pull Requests

- [#3734](https://github.com/rollup/rollup/pull/3734): Prevent ASI when simplifying a nested logical expression ( @lukastaegert)

## 2.26.2

_2020-08-16_

### Bug Fixes

- Fix a situation where line-breaks in a simplified conditional expression could result in broken code (#3732)

### Pull Requests

- [#3732](https://github.com/rollup/rollup/pull/3732): Prevent unintended ASI for nested conditionals (@lukastaegert)

## 2.26.1

_2020-08-16_

### Bug Fixes

- Correctly render external namespace imports when only generating SystemJS output (#3731)

### Pull Requests

- [#3731](https://github.com/rollup/rollup/pull/3731): Render system namespace import (@sastan and @lukastaegert)

## 2.26.0

_2020-08-15_

### Features

- Add a new entry `importedBindings` to the bundle information to list bindings per dependency (#3722)

### Bug Fixes

- Do not render an invalid UMD wrapper when no bindings are imported from a dependency (#3724)
- Avoid situations where removing the `else` branch from an `if` statement might catch the `else` branch from another one (#3725)

### Pull Requests

- [#3722](https://github.com/rollup/rollup/pull/3722): Add import specifiers to bundle information (@lukastaegert)
- [#3724](https://github.com/rollup/rollup/pull/3724): Fix missing variables for UMD and IIFE builds (@lukastaegert)
- [#3725](https://github.com/rollup/rollup/pull/3725): Do not entirely remove else branch if another else branch might accidentally be referenced (@lukastaegert)

## 2.25.0

_2020-08-14_

### Features

- Add `--failAfterWarnings` CLI flag that will complete builds with warnings but return an error at the end (#3712)

### Pull Requests

- [#3712](https://github.com/rollup/rollup/pull/3712): Implement `--failAfterWarnings` flag (@tjenkinson)

## 2.24.0

_2020-08-13_

### Features

- Allow defining interop per dependency via a function (#3710)
- Support interop "auto" as a more compatible version of "true" (#3710)
- Support interop "default" and "esModule" to avoid unnecessary interop helpers (#3710)
- Support interop "defaultOnly" for simplified helpers and Node ESM interop compatible output (#3710)
- Respect interop option for external dynamic imports (#3710)
- Support live-bindings for external default imports in non-ES formats unless "externalLiveBindings" is "false" (#3710)
- Use shared default interop helpers for AMD, UMD and IIFE formats (#3710)
- Avoid unnecessarily deconflicted module variables in non-ES formats (#3710)
- Freeze generated interop namespace objects (#3710)
- Always mark interop helpers as pure (#3710)
- Avoid default export interop if there is already an interop namespace object (#3710)
- Sort all `require` statements to the top in CommonJS output for easier back-transpilation to ES modules by other tools (#3710)

### Bug Fixes

- Handle accessing `super` in static class fields (#3720)
- Deconflict the names of helper variables introduced for interop (#3710)
- Generate proper namespace objects for static namespace imports in non-ES formats (#3710)
- Do not add unused interop helpers when using the renderDynamicImport hook (#3710)

### Pull Requests

- [#3710](https://github.com/rollup/rollup/pull/3710): Rework interop handling (@lukastaegert)
- [#3720](https://github.com/rollup/rollup/pull/3720): Handle super in static class fields (@lukastaegert)

## 2.23.1

_2020-08-07_

### Bug Fixes

- Fix an issue where dynamically importing an entry point could return a malformed namespace for CJS and AMD formats ( #3709)

### Pull Requests

- [#3709](https://github.com/rollup/rollup/pull/3709): Properly construct namespace when dynamically importing chunks with facades in default export mode (@lukastaegert)

## 2.23.0

_2020-07-23_

### Features

- Handle environments with only globalThis in UMD output (#3691)

### Pull Requests

- [#3691](https://github.com/rollup/rollup/pull/3691): Check for globalThis in UMD wrapper (@lukastaegert)

## 2.22.2

_2020-07-21_

### Bug Fixes

- Always generate correct exports when an implicit entry is reexporting from another module (#3688)

### Pull Requests

- [#3688](https://github.com/rollup/rollup/pull/3688): Include all relevant modules to generate reexports for implicit dependencies (@lukastaegert)

## 2.22.1

_2020-07-18_

### Bug Fixes

- Remove unused arguments when calling a conditional expression (#3680)

### Pull Requests

- [#3680](https://github.com/rollup/rollup/pull/3680): Allow tree-shaking of arguments of functions that are returned by conditional expressions (@lukastaegert)

## 2.22.0

_2020-07-18_

### Features

- Allow resolving synthetic named exports via an arbitrary export name (#3657)
- Display a warning when the user does not explicitly select an export mode and would generate a chunk with default export mode when targeting CommonJS (#3657)

### Pull Requests

- [#3657](https://github.com/rollup/rollup/pull/3657): Add basic support for using a non-default export for syntheticNamedExports (@lukastaegert)
- [#3659](https://github.com/rollup/rollup/pull/3659): Warn when implicitly using default export mode (@lukastaegert)

## 2.21.0

_2020-07-07_

### Features

- Allow plugins to disable tree-shaking for individual modules to ensure even empty modules are associated with chunks ( #3663)

### Pull Requests

- [#3663](https://github.com/rollup/rollup/pull/3663): Disable treeshaking per module (@lukastaegert)

## 2.20.0

_2020-07-06_

### Features

- Support using a function to generate different chunk and asset naming patterns per chunk or asset (#3658)
- Add `referencedFiles` property to the chunk info in generateBundle to list referenced assets (#3661)

### Pull Requests

- [#3658](https://github.com/rollup/rollup/pull/3658): Add ability to use a function that returns a pattern string in all places where you could use a pattern string before (@frank-dspeed)
- [#3661](https://github.com/rollup/rollup/pull/3661): Add referenced files to bundle (@lukastaegert)

## 2.19.0

_2020-07-05_

### Features

- Allow plugins to return a Promise in the options hook (#3660)

### Pull Requests

- [#3660](https://github.com/rollup/rollup/pull/3660): Make options hooks async (@TomerAberbach)

## 2.18.2

_2020-07-02_

### Bug Fixes

- Do not remove spread element args when the corresponding positional parameter is unused (#3652)

### Pull Requests

- [#3652](https://github.com/rollup/rollup/pull/3652): Do not tree-shake arguments that contain a spread element ( @lukastaegert)

## 2.18.1

_2020-06-26_

### Bug Fixes

- Make sure synthetic exports are present when a module is imported dynamically (#3648)
- Strip the `rollup-plugin-` prefix off the plugin name when looking for the plugin export in a CLI plugin without a default export (#3647)
- Convert plugin names with dashes to camel case when looking for the plugin export in a CLI plugin without a default export (#3647)

### Pull Requests

- [#3647](https://github.com/rollup/rollup/pull/3647): Strip rollup-plugin prefix to find named plugin exports, throw when export cannot be found (@lukastaegert)
- [#3648](https://github.com/rollup/rollup/pull/3648): Always create a dynamic namespace object when a module with synthetic named exports is imported dynamically (@lukastaegert)

## 2.18.0

_2020-06-22_

### Features

- `inlineDynamicImports`, `manualChunks` and `preserveModules` can now be used as output options (#3645)
- Use sourcemaps for certain warnings that reference source code locations (#3645)

### Bug Fixes

- `this.getFileName` will now always return the correct file name for chunks when multiple outputs are created (#3645)

### Pull Requests

- [#3645](https://github.com/rollup/rollup/pull/3645): Per output chunking (@lukastaegert)

## 2.17.1

_2020-06-19_

### Bug Fixes

- Properly resolve accessing properties of namespace members again (#3643)

### Pull Requests

- [#3643](https://github.com/rollup/rollup/pull/3643): Fix accessing nested properties of namespaces (@lukastaegert)

## 2.17.0

_2020-06-17_

### Features

- When importing Rollup via package.exports, always fall back to the browser ESM build for non-Node environments (#3634)
- Create more efficient code when handling namespace mutations (#3637)

### Bug Fixes

- Fix a severe performance regression when the same module is imported by a lot of modules (#3641)
- Properly escape special characters in imports (#3638)

### Pull Requests

- [#3634](https://github.com/rollup/rollup/pull/3634): Set browser build in exports (@guybedford)
- [#3637](https://github.com/rollup/rollup/pull/3637): Do not include the whole namespace when illegally mutating a namespace (@lukastaegert)
- [#3638](https://github.com/rollup/rollup/pull/3638): Support backslash escaping, retain exact newline escaping ( @guybedford)
- [#3641](https://github.com/rollup/rollup/pull/3641): Fix performance regression when a file is imported by many importers (@lukastaegert)

## 2.16.1

_2020-06-13_

### Bug Fixes

- Do not produce invalid code when an external or chunk id contain quotes or line-breaks (#3632)
- Do not fail but emit a warning when mutating a namespace object (#3633)

### Pull Requests

- [#3632](https://github.com/rollup/rollup/pull/3632): Handle single quote escaping in ids (@guybedford)
- [#3633](https://github.com/rollup/rollup/pull/3633): Turn namespace assignment error into a warning (@guybedford)

## 2.16.0

_2020-06-12_

### Features

- Add support for numeric separators (#3626)
- Switch to finalized ESTree optional chaining AST (#3628)

### Pull Requests

- [#3626](https://github.com/rollup/rollup/pull/3626): Support numeric separator (@TrySound)
- [#3628](https://github.com/rollup/rollup/pull/3628): Acorn 7.3.0 upgrade (@guybedford)
- [#3631](https://github.com/rollup/rollup/pull/3631): Improve discoverability of `manualChunks` for code splitting ( @zlamma)

## 2.15.0

_2020-06-08_

### Features

- Allow to skip watching some configs via `watch: false` (#3620)
- Provide the resolved sourcemap path to `sourcemapPathTransform` (#3617)

### Pull Requests

- [#3617](https://github.com/rollup/rollup/pull/3617): Update sourcemapPathTransform to also take the path to the sourcemap file as a second argument (@dgoldstein0)
- [#3620](https://github.com/rollup/rollup/pull/3620): Rollup watch only one config in exported array (@luwol03)

## 2.14.0

_2020-06-07_

### Features

- Make `this.meta.watchMode` available for plugins to detect watch mode (#3616)

### Bug Fixes

- Handle exporting the same binding with different names in SystemJS (#3575)

### Pull Requests

- [#3575](https://github.com/rollup/rollup/pull/3575): Handle some cases of duplicate export bindings (@joeljeske)
- [#3616](https://github.com/rollup/rollup/pull/3616): Make watch mode available in plugins (@lukastaegert)

## 2.13.1

_2020-06-04_

### Bug Fixes

- Prevent conflicts in SystemJS when `module` is used as a top-level variable (#3614)

### Pull Requests

- [#3614](https://github.com/rollup/rollup/pull/3614): Handle system reserved identifier dedupes (@guybedford)

## 2.13.0

_2020-06-03_

### Features

- Allow to specify that an emitted chunk is only loaded after a given module has loaded to improve chunking (#3606)

### Pull Requests

- [#3606](https://github.com/rollup/rollup/pull/3606): Enable specifying implicit dependencies when emitting chunks ( @lukastaegert)

## 2.12.1

_2020-06-02_

### Bug Fixes

- Render valid imports when chunk names correspond to directory names in virtual setups (#3609)

### Pull Requests

- [#3609](https://github.com/rollup/rollup/pull/3609): Handle imports from chunks with names that correspond to parent directory names of other chunks (@guybedford)

## 2.12.0

_2020-05-31_

### Features

- Add an option `--waitForBundleInput` to let the build wait until all entry point files are available before starting ( #3577)

### Pull Requests

- [#3577](https://github.com/rollup/rollup/pull/3577): Wait for bundle input option (@Heerschop)

## 2.11.2

_2020-05-28_

### Bug Fixes

- Include side-effects in the second argument of `Array.from` (#3604)

### Pull Requests

- [#3604](https://github.com/rollup/rollup/pull/3604): Mark `Array.from` as side-effectful, use two-argument Array.from when mapping Sets (@lukastaegert)

## 2.11.1

_2020-05-28_

### Bug Fixes

- Also include side-effects in files that are marked as side-effect-free if they contain an included default export that is reexported (#3602)

### Pull Requests

- [#3602](https://github.com/rollup/rollup/pull/3602): Handle side-effects next to side-effect-free default exports in case the default export is reexported (@lukastaegert)

## 2.11.0

_2020-05-27_

### Features

- Add basic support for optional chaining (#3582)
- Provide a normalized set of options with proper default values to `buildStart` and `renderStart` (#3597)
- Do not count adding properties to the prototype of an unused class as a side-effect (#3598)
- Support providing `null` for empty setters in SystemJS via option (#3592)

### Bug Fixes

- Do not fail when using a `/*#__PURE__*/` annotation inside a class field (#3599)
- Allow using `--watch` and `--treeshake` together with sub-options such as `--watch.clearScreen` on the command line ( #3597)

### Pull Requests

- [#3582](https://github.com/rollup/rollup/pull/3582): Support optional chaining via acorn fork(@guybedford)
- [#3592](https://github.com/rollup/rollup/pull/3592): System format optional setters(@guybedford)
- [#3597](https://github.com/rollup/rollup/pull/3597): Provide normalized options (@lukastaegert)
- [#3598](https://github.com/rollup/rollup/pull/3598): Treeshake prototype modifications in classes (@lukastaegert)
- [#3599](https://github.com/rollup/rollup/pull/3599): Retain pure annotations in class fields (@lukastaegert)
- [#3601](https://github.com/rollup/rollup/pull/3601): Fix white-space in docs (@tu4mo)

## 2.10.9

_2020-05-24_

### Bug Fixes

- Prevent invalid exports when facades are created (#3590)

### Pull Requests

- [#3590](https://github.com/rollup/rollup/pull/3590): Prevent unneeded exports when entry facades are created and ensure all exported variables in facades are imported (@lukastaegert)

## 2.10.8

_2020-05-23_

### Bug Fixes

- Fix issues when synthetic named exports are reexported as default exports (#3586)

### Pull Requests

- [#3584](https://github.com/rollup/rollup/pull/3584): Clarify documentation for `output.paths` (@jacksteamdev)
- [#3585](https://github.com/rollup/rollup/pull/3585): Target Node.js v14 instead of v13 in Windows tests (@mangs)
- [#3586](https://github.com/rollup/rollup/pull/3586): Handle default reexports of synthetic named exports over several stages (@lukastaegert)

## 2.10.7

_2020-05-22_

### Bug Fixes

- Handle modules re-exporting namespaces without further own code (#3576)

### Pull Requests

- [#3576](https://github.com/rollup/rollup/pull/3576): Fix "cannot read exports of undefined" error (@guybedford)

## 2.10.6

_2020-05-22_

### Bug Fixes

- Fix some issues around class fields (#3580)
- Prevent a maximum call stack error when a called entity references itself in its declaration (#3581)

### Pull Requests

- [#3580](https://github.com/rollup/rollup/pull/3580): Update acorn class features (@guybedford)
- [#3581](https://github.com/rollup/rollup/pull/3581): Do not fail when including call arguments of recursively defined variables (@lukastaegert)

## 2.10.5

_2020-05-19_

### Bug Fixes

- Do not remove side-effects that may influence an included default export declaration when side-effects are disabled ( #3572)

### Pull Requests

- [#3572](https://github.com/rollup/rollup/pull/3572): Observe side-effects in files containing a default export declaration that reexports a variable (@lukastaegert)

## 2.10.4

_2020-05-19_

### Bug Fixes

- Tree-shake unused classes with fields unless there are side-effects in the field declaration (#3569)

### Pull Requests

- [#3569](https://github.com/rollup/rollup/pull/3569): Make sure unused classes with fields are tree-shaken if possible (@lukastaegert)

## 2.10.3

_2020-05-18_

### Bug Fixes

- Validate return value of sourcemapPathTransform option (#3561)

### Pull Requests

- [#3561](https://github.com/rollup/rollup/pull/3561): Throw error if sourcemapPathTransform-option does not return a string (@Simonwep)

## 2.10.2

_2020-05-15_

### Bug Fixes

- Properly include calls to mutating array methods in certain scenarios (#3559)

### Pull Requests

- [#3559](https://github.com/rollup/rollup/pull/3559): Make sure UnknownFooExpressions are included when referenced as return values in a MultiExpression (@lukastaegert)

## 2.10.1

_2020-05-15_

### Bug Fixes

- Do not throw when "undefined" is used as a default export (#3558)

### Pull Requests

- [#3558](https://github.com/rollup/rollup/pull/3558): Properly handle default exporting undefined (@lukastaegert)

## 2.10.0

_2020-05-13_

### Features

- Avoid unnecessary empty imports from a facade chunk to the original chunk (#3552)
- Pin facade creation order so that if several user-defined chunks reference the same module, the first always becomes the "actual" chunk while the later ones become facades (#3552)

### Bug Fixes

- Do not omit reexports from secondary chunks when creating facades for entry points without hoisting transitive dependencies (#3552)

### Pull Requests

- [#3552](https://github.com/rollup/rollup/pull/3552): Avoid unnecessary facade dependency inlining (@guybedford)

## 2.9.1

_2020-05-11_

### Bug Fixes

- Do not create unintended live-bindings or invalid reexports when reexporting global variables (#3550)

### Pull Requests

- [#3550](https://github.com/rollup/rollup/pull/3550): Track updates of globals that are exported as default ( @lukastaegert)

## 2.9.0

_2020-05-10_

### Features

- Add ids of static and dynamic imports to `this.getModuleInfo` (#3542)
- Provide `getModuleInfo` and `getModuleIds` to `manualChunks` functions (#3542)
- Add nullish coalescing support (#3548)
- Make the rebuild delay in watch mode configurable and set the default to `0` for snappy rebuilds (#3502)
- Add `this.getModuleIds` to the plugin context as future replacement for `this.moduleIds` (#3542)

### Pull Requests

- [#3502](https://github.com/rollup/rollup/pull/3502): Configurable build delay (@mattdesl)
- [#3542](https://github.com/rollup/rollup/pull/3542): Extend manualChunks API (@lukastaegert)
- [#3548](https://github.com/rollup/rollup/pull/3548): Support nullish coalescing with tree-shaking (@lukastaegert)

## 2.8.2

_2020-05-07_

### Bug Fixes

- Avoid invalid code when simplifying the body of a shorthand arrow function expression (#3540)

### Pull Requests

- [#3540](https://github.com/rollup/rollup/pull/3540): Wrap object expressions in parentheses if they become children of an arrow function expression (@lukastaegert)

## 2.8.1

_2020-05-07_

### Bug Fixes

- Allow using plugins on CLI that are exported as `exports.default` (#3529)
- Do not fail side-effect detection in nested callbacks of builtins (#3539)

### Pull Requests

- [#3529](https://github.com/rollup/rollup/pull/3529): Use default named export with plugins (@NotWoods)
- [#3539](https://github.com/rollup/rollup/pull/3539): Track call side-effects both by entity and CallExpression to avoid untracked side-effects in nested calls (@lukastaegert)

## 2.8.0

_2020-05-06_

### Features

- When a dynamically imported chunk contains more exports than the imported module namespace, do not create a facade chunk but an inline namespace (#3535)

### Bug Fixes

- Do not execute dynamically imported code before synchronous code in the importing module when generating CommonJS ( #3535)

### Pull Requests

- [#3535](https://github.com/rollup/rollup/pull/3535): Avoid dynamic facade chunks (@lukastaegert)

## 2.7.6

_2020-04-30_

### Bug Fixes

- Fix a type issue when a default export references a global variable (#3526)

### Pull Requests

- [#3526](https://github.com/rollup/rollup/pull/3526): Handles default exporting global variables (@lukastaegert)

## 2.7.5

_2020-04-29_

### Bug Fixes

- Prevent infinite loop when default values of function parameters in a default export contain a slash (#3522)

### Pull Requests

- [#3522](https://github.com/rollup/rollup/pull/3522): Avoid infinite loop when finding position for id insertion in default export (@lukastaegert)

## 2.7.4

_2020-04-29_

### Bug Fixes

- Fix an issue where wrong variable names were used when preserving modules (#3521)

### Pull Requests

- [#3521](https://github.com/rollup/rollup/pull/3521): Fix and improve default export alias logic (@lukastaegert)

## 2.7.3

_2020-04-27_

### Bug Fixes

- Do not access `__proto__` when running Rollup (#3518)

### Pull Requests

- [#3518](https://github.com/rollup/rollup/pull/3518): use acorn-class-fields and acorn-static-class-features from npm ( @nitsky)

## 2.7.2

_2020-04-22_

### Bug Fixes

- Prevent an infinite loop when creating separate manual chunks with circular dependencies (#3510)
- Do not fail if "super" is used in the definition of a class field (#3511)
- Throw if a plugin tries to emit a file with an absolute Windows path (#3509)

### Pull Requests

- [#3509](https://github.com/rollup/rollup/pull/3509): Ban emitFile via absolute paths on Windows OS (@SASUKE40)
- [#3510](https://github.com/rollup/rollup/pull/3510): Do not fail for circular imports between manual chunks ( @lukastaegert)
- [#3511](https://github.com/rollup/rollup/pull/3511): Support "super" in class fields (@lukastaegert)

## 2.7.1

_2020-04-21_

### Bug Fixes

- Use correct path for dynamic imports if `output.paths` is used (#3508)

### Pull Requests

- [#3508](https://github.com/rollup/rollup/pull/3508): Respect output.paths in dynamic imports (@lukastaegert)

## 2.7.0

_2020-04-21_

### Features

- Add `preserveEntrySignatures` option to control how exports of entry points are handled (#3498)
- Add `preserveSignature` flag to `this.emitFile` to control exports of emitted chunks (#3498)
- Add `output.minifyInternalExports` option to control if internal exports are minified (#3498)

### Pull Requests

- [#3498](https://github.com/rollup/rollup/pull/3498): Add option to configure if entry signatures are preserved ( @lukastaegert)

## 2.6.1

_2020-04-12_

### Bug Fixes

- Close watch mode when stdin closes in a non-TTY environment (#3493)

### Pull Requests

- [#3493](https://github.com/rollup/rollup/pull/3493): Ensure --watch mode exits correctly when stdin is closed ( @jakesgordon)

## 2.6.0

_2020-04-10_

### Features

- Allow regular expressions to declare external modules (#3482)

### Pull Requests

- [#3482](https://github.com/rollup/rollup/pull/3482): Allow regular expressions in config.external (@johannes-z)

## 2.5.0

This version is identical to 2.4.0

## 2.4.0

_2020-04-09_

### Features

- Add support for most private and public class field features (#3488)

### Bug Fixes

- Do not replace `this` with `undefined` in class field definitions (#3488)

### Pull Requests

- [#3488](https://github.com/rollup/rollup/pull/3488): Rollup class fields support (@guybedford and @lukastaegert)

## 2.3.5

_2020-04-09_

### Bug Fixes

- Never remove labels when tree-shaking is disabled (#3492)

### Pull Requests

- [#3492](https://github.com/rollup/rollup/pull/3492): Always use a new inclusion context when including declarations of variables, always inlcude labels when not treeshaking (@lukastaegert)

## 2.3.4

_2020-04-07_

### Bug Fixes

- Handle re-exporting synthetic exports from entry-points (#3319)
- Fix cross-chunk imports of synthetic exports (#3319)
- Handle namespace objects that contain re-exported synthetic namespaces (#3319)

### Pull Requests

- [#3319](https://github.com/rollup/rollup/pull/3319): Handle re-exports of synthetic named exports (@manucorporat and @lukastaegert)

## 2.3.3

_2020-04-04_

### Bug Fixes

- Add external namespaces to dynamic namespace objects (#3474)

### Pull Requests

- [#3474](https://github.com/rollup/rollup/pull/3474): Support external star exports on namespace objects (@guybedford)

## 2.3.2

_2020-03-31_

### Bug Fixes

- Only warn but do not fail build when a namespace is called as a function (#3475)
- Make sure pre-existing sourcemap comments are also removed when rebuilding using the cache (#3476)

### Pull Requests

- [#3475](https://github.com/rollup/rollup/pull/3475): Call namespace error as a warning (@guybedford)
- [#3476](https://github.com/rollup/rollup/pull/3476): Store locations for removed comments in cache (@lukastaegert)

## 2.3.1

_2020-03-30_

### Bug Fixes

- Do not fail if the config file returns an function returning a Promise (#3472)

### Pull Requests

- [#3472](https://github.com/rollup/rollup/pull/3472): Fix support for async functions as config (@lukastaegert)

## 2.3.0

_2020-03-29_

### Features

- Do not transpile config files with `.mjs` extension in Node 13+ or `.cjs` extension in any Node version and load them appropriately (#3445)
- Extract helper to load a config file the way rollup does it via `rollup/dist/loadConfigFile` (#3445)

### Bug Fixes

- Keep watching the config file if an error occurs during initial load in watch node (#3445)
- Add a helpful error message when using a transpiled config in a repository with "type": "module" (#3445)

### Pull Requests

- [#3445](https://github.com/rollup/rollup/pull/3445): Support native ESM configs in Node 13, support untranspiled configs (@lukastaegert)
- [#3468](https://github.com/rollup/rollup/pull/3468): Don't use esm output format alias in the documentation (@vsn4ik)

## 2.2.0

_2020-03-24_

### Features

- Add `renderDynamicImport` hook to rewrite dynamic import expressions (#3449)
- Add information about dynamically imported modules to `this.getModuleInfo` (#3449)

### Bug Fixes

- Make file emission work with Uin8Array sources when using Rollup in the browser (#3452)
- Fix types to allow watch to accept an array of configs (#3453)
- Do not strip `.js` extensions from AMD imports when the import is a user-supplied replacement for a non-resolvable dynamic import target (#3453)

### Pull Requests

- [#3449](https://github.com/rollup/rollup/pull/3449): Add hook to rewrite dynamic import expressions (@lukastaegert)
- [#3452](https://github.com/rollup/rollup/pull/3452): Avoid the assumption of Buffer in browser envs (@JoviDeCroock)
- [#3453](https://github.com/rollup/rollup/pull/3453): fix types since watch accepts single or array config (@lukeed)
- [#3456](https://github.com/rollup/rollup/pull/3456): fix SystemJS url in tutorial (@guybedford)

## 2.1.0

_2020-03-18_

### Features

- Allow specifying an importer when emitting files to resolve relative ids (#3442)

### Pull Requests

- [#3442](https://github.com/rollup/rollup/pull/3442): Add optional `importer` parameter to `this.emitFile` ( @lukastaegert)

## 2.0.6

_2020-03-13_

### Bug Fixes

- Do not use file names from different outputs when generating sourcemaps using the `dir` option (#3440)

### Pull Requests

- [#3440](https://github.com/rollup/rollup/pull/3440): Use correct file names when writing sourcemaps for multiple outputs (@lukastaegert)

## 2.0.5

_2020-03-12_

### Bug Fixes

- Fix an issue where conditional statements would assume they have the wrong test value (#3438)

### Pull Requests

- [#3438](https://github.com/rollup/rollup/pull/3438): Make sure logical expressions always check the left argument for side-effects (@lukastaegert)

## 2.0.4

_2020-03-12_

### Bug Fixes

- Avoid conflicts between namespace imports when preserving modules (#3435)

### Pull Requests

- [#3435](https://github.com/rollup/rollup/pull/3435): Deconflict multiple `index` imports for ES format using nested export star statements (@kamranayub)

## 2.0.3

_2020-03-10_

### Bug Fixes

- Add type for this.getCombinedSourcemap to transform context (#3431)

### Pull Requests

- [#3377](https://github.com/rollup/rollup/pull/3377): Switch to yargs-parser lib (@jamesgeorge007)
- [#3426](https://github.com/rollup/rollup/pull/3426): Use strict types with PluginDriver (@NotWoods)
- [#3431](https://github.com/rollup/rollup/pull/3431): Add missing type declaration for getCombinedSourcemap ( @Anidetrix)
- [#3432](https://github.com/rollup/rollup/pull/3432): Detail how return values from `augmentChunkHash` are used ( @jakearchibald)

## 2.0.2

_2020-03-07_

### Bug Fixes

- Make sure the ESM import still works (#3430)

### Pull Requests

- [#3430](https://github.com/rollup/rollup/pull/3430): Fix conditional exports again (@lukastaegert)

## 2.0.1

_2020-03-07_

### Bug Fixes

- Reenable importing rollup in Node 13.0 - 13.7 (#3428)

### Pull Requests

- [#3428](https://github.com/rollup/rollup/pull/3428): Fix conditional exports in Node 13.0 - 13.7 (@lukastaegert)

## 2.0.0

_2020-03-06_

### Breaking Changes

- Rollup now requires at least Node 10 to run, or a sufficiently modern browser (#3346)
- The file structure of Rollup's ESM builds has changed:
  - The main ESM entry point is now at `rollup/dist/es/rollup.js` instead of `rollup/dist/rollup.es.js`
  - The ESM browser build is at `rollup/dist/es/rollup.browser.js` instead of `rollup/dist/rollup.browser.es.js`

  In general, the ESM builds now follow the same naming scheme as the CJS builds but are located in the `rollup/dist/es` subfolder instead of `rollup/dist` (#3391)

- The "watch.chokidar" option no longer accepts a `boolean` value but only an object of parameters that is passed to the bundled Chokidar instance. Chokidar installations by the user will be ignored in favour of the bundled instance ( #3331)
- Modules that are completely tree-shaken will no longer be listed as part of any chunks in `generateBundle`
- The `experimentalOptimizeChunks` and `chunkGroupingSize` options have been removed
- [acorn](https://github.com/acornjs/acorn) plugins can only be used if they accept a passed-in acorn instance instead of importing it themselves. See https://github.com/acornjs/acorn/pull/870#issuecomment-527339830 for what needs to be done to make plugins compatible that do not support this yet (#3391)
- Emitted chunks now have the TypeScript type `Uint8Array` instead of `Buffer`. A `Buffer` can still be used, though ( #3395)
- The TypeScript types no longer use ESTree types for AST nodes but a very generic type that does not contain information specific to certain node types (#3395)
- The signature of the `writeBundle` plugin hook has been changed to match `generateBundle`: The bundle object is now passed as second parameter instead of first and the first parameter is the output options (#3361)
- The following plugin hooks have been removed:
  - ongenerate: use `generateBundle` instead
  - onwrite: use `writeBundle` instead
  - transformBundle: use `renderChunk` instead
  - transformChunk: use `renderChunk` instead
- You can no longer access `this.watcher` on the plugin context.
- The `transform` hook can no longer return `dependencies`.
- The `treeshake.pureExternalModules` option will now show a deprecation warning when used: use `treeshake.moduleSideEffects: 'no-external'` instead
- Using `import.meta.ROLLUP_ASSET_URL_<..>` and `import.meta.ROLLUP_CHUNK_URL_<..>` in code will now show warnings: use `import.meta.ROLLUP_FILE_URL_<..>` instead
- The `resolveAssetUrl` hook will now show a deprecation warning when used: use `resolveFileUrl` instead
- The following plugin context functions will show warnings when used:
  - `this.emitAsset`: use `this.emitFile`
  - `this.emitChunk`: use `this.emitFile`
  - `this.getAssetFileName`: use `this.getFileName`
  - `this.getChunkFileName`: use `this.getFileName`
  - `this.isExternal`: use `this.resolve`
  - `this.resolveId`: use `this.resolve`
- Directly adding properties to the bundle object in the `generateBundle` is deprecated will show a warning (removing properties is allowed, though): Use `this.emitFile`
- Accessing `chunk.isAsset` on the bundle is deprecated: Use `chunk.type === 'asset'` instead
- The error code for a missing `name` property when targeting UMD has been changed to `MISSING_NAME_OPTION_FOR_IIFE_EXPORT` to emphasize this is needed for the IIFE part of UMD (#3393)

### Features

- Rollup now bundles [Chokidar](https://github.com/paulmillr/chokidar) for a better watch experience (#3331)
- Rollup now bundles [acorn](https://github.com/acornjs/acorn) again, removing its only external dependency (#3391)
- Do not consider empty imports from side-effect-free modules for chunking and hoist side-effect imports if necessary ( #3369)
- Rollup can now be imported as an ES module in Node via `import {rollup} from 'rollup'`. Note that this relies on Node's experimental [conditional package exports](https://nodejs.org/dist/latest-v13.x/docs/api/esm.html#esm_conditional_exports) feature and is therefore itself experimental (#3391)
- `systemjs` can be used as format alias for `system` (#3381)

### Bug Fixes

- Unknown output options now trigger a warning when using the JavaScript API (#3352)
- Rollup will no longer introduce Node types into TypeScript projects that do not use them (#3395)
- Generate correct sourcemaps when tree-shaking occurs in a multi-file bundle (#3423)

### Pull Requests

- [#3331](https://github.com/rollup/rollup/pull/3331): Bundle Chokidar (@lukastaegert)
- [#3343](https://github.com/rollup/rollup/pull/3343): Remove experimentalOptimizeChunks (@lukastaegert)
- [#3346](https://github.com/rollup/rollup/pull/3346): Update minimum required Node version to 10 (@lukastaegert)
- [#3352](https://github.com/rollup/rollup/pull/3352): Remove active deprecations (@lukastaegert)
- [#3361](https://github.com/rollup/rollup/pull/3361): Change writeBundle signature to match generateBundle ( @lukastaegert)
- [#3369](https://github.com/rollup/rollup/pull/3369): Avoid empty imports from side-effect-free chunks (@lukastaegert)
- [#3381](https://github.com/rollup/rollup/pull/3381): Rename esm to es everywhere, add systemjs alias (@lukastaegert)
- [#3391](https://github.com/rollup/rollup/pull/3391): Bundle acorn, allow importing Rollup as Node ES module, update dependencies (@lukastaegert)
- [#3393](https://github.com/rollup/rollup/pull/3393): Better error code for name-less umd bundle (@rail44)
- [#3395](https://github.com/rollup/rollup/pull/3395): Remove `@types` dependencies (@lukastaegert)
- [#3423](https://github.com/rollup/rollup/pull/3423): Update magic-string and fix sourcemaps (@lukastaegert)

For previous changelogs, see

- [Rollup 1.x](./CHANGELOG-1.md)
- [Rollup 0.x](./CHANGELOG-0.md)
