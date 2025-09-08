# rollup changelog

## 1.32.1

_2020-03-06_

### Bug Fixes

- Handle default export detection for AMD and IIFE externals that do not have a prototype (#3420)
- Handle missing whitespace when the else branch of an if-statement is simplified (#3421)
- Mention the importing module when reporting errors for missing named exports (#3401)
- Add code to warning for missing output.name of IIFE bundles (#3372)

### Pull Requests

- [#3372](https://github.com/rollup/rollup/pull/3372): Add warning code for missing output.name of IIFE bundle that has export (@rail44)
- [#3401](https://github.com/rollup/rollup/pull/3401): Missing exports errors now print the importing module (@timiyay)
- [#3418](https://github.com/rollup/rollup/pull/3418): Structure lifecycle hooks, add links to build time hooks ( @lukastaegert)
- [#3420](https://github.com/rollup/rollup/pull/3420): Update generated code of getInteropBlock() to work with null prototype objects (@jdalton)
- [#3421](https://github.com/rollup/rollup/pull/3421): Avoid invalid code when "else" branch is simplified ( @lukastaegert)

## 1.32.0

_2020-02-28_

### Features

- Allow adding plugins on the command line via `--plugin <plugin>` (#3379)

### Pull Requests

- [#3379](https://github.com/rollup/rollup/pull/3379): introduce CLI --plugin support (@kzc)
- [#3390](https://github.com/rollup/rollup/pull/3390): fix typo: this.addWatchfile (@mistlog)
- [#3392](https://github.com/rollup/rollup/pull/3392): Bump codecov from 3.6.1 to 3.6.5
- [#3404](https://github.com/rollup/rollup/pull/3404): Update resolveFileUrl docs (@jakearchibald)

## 1.31.1

_2020-02-14_

### Bug Fixes

- Make sure errored files are always re-evaluated in watch mode to avoid an issue in the typescript plugin (#3388)

### Pull Requests

- [#3366](https://github.com/rollup/rollup/pull/3366): Correct spelling minifaction to minification (@VictorHom)
- [#3371](https://github.com/rollup/rollup/pull/3371): Adjust bug template to mention REPL.it (@lukastaegert)
- [#3388](https://github.com/rollup/rollup/pull/3388): Run transform hooks again in watch mode on files that errored ( @lukastaegert)

## 1.31.0

_2020-01-31_

### Features

- Always disable tree-shaking for asm.js functions to maintain semantics (#3362)

### Pull Requests

- [#3362](https://github.com/rollup/rollup/pull/3362): Preserve asm.js code (@lukastaegert)

## 1.30.1

_2020-01-27_

### Bug Fixes

- Do not mistreat static entgry points as dynamic ones when chunking (#3357)
- Resolve a crash when chunking circular dynamic imports (#3357)

### Pull Requests

- [#3357](https://github.com/rollup/rollup/pull/3357): Resolve issues with circular dynamic entries (@lukastaegert)

## 1.30.0

_2020-01-27_

### Features

- Do not split chunks when dynamically imported modules import modules that are already loaded by all dynamic importers (#3354)
- Add `hoistTransitiveImports` option to disable hoisting imports of static dependencies into entry chunks (#3353)

### Bug Fixes

- Make sure polyfills are always loaded first when each static entry point contains them as first import (#3354)

### Pull Requests

- [#3353](https://github.com/rollup/rollup/pull/3353): Add option to avoid hoisting transitive imports (@lukastaegert)
- [#3354](https://github.com/rollup/rollup/pull/3354): Improve chunking algorithm for dynamic imports (@tjenkinson and @lukastaegert)

## 1.29.1

_2020-01-21_

### Bug Fixes

- Avoid crashes for circular reexports when named exports cannot be found (#3350)

### Pull Requests

- [#3335](https://github.com/rollup/rollup/pull/3335): Fix typo (@robbinworks)
- [#3342](https://github.com/rollup/rollup/pull/3342): Remove ":" from test file names for Windows and update dependencies (@lukastaegert)
- [#3350](https://github.com/rollup/rollup/pull/3350): Properly handle circular reexports (@lukastaegert)

## 1.29.0

_2020-01-08_

### Features

- Enable top-level await by default (#3089)
- Add typings for watch events (#3302)

### Bug Fixes

- Deconflict files that would conflict only on a case-insensitive OS (#3317)
- Do not fail in certain scenarios where a logical expression inside a sequence expression was being directly included ( #3327)

### Pull Requests

- [#3089](https://github.com/rollup/rollup/pull/3089): Move top-level await out of experimental (@guybedford)
- [#3302](https://github.com/rollup/rollup/pull/3302): Adds type definitions for RollupWatcher events (@NotWoods)
- [#3317](https://github.com/rollup/rollup/pull/3317): Fix module id conflict on a case insensitive OS (@yesmeck)
- [#3327](https://github.com/rollup/rollup/pull/3327): Handle deoptimizations while a node is being included ( @lukastaegert)

## 1.28.0

_2020-01-04_

### Features

- Allow piping in stdin via the command line interface (#3312, #3290)
- Allow plugins to mark modules as having syntheticNamedExports for e.g. better CJS interoperability (#3295)
- Ignore variable reassignments in dead code when tree-shaking to remove more unneeded code (#3212)

### Bug Fixes

- Properly respect tree-shaken code when generating sourcemaps (#3318)

### Pull Requests

- [#3212](https://github.com/rollup/rollup/pull/3212): Handle assignments in dead code (@tjenkinson)
- [#3290](https://github.com/rollup/rollup/pull/3290): Implement stdin input with optional "-" as the file name (@kzc)
- [#3295](https://github.com/rollup/rollup/pull/3295): Add syntheticNamedExports (@manucorporat)
- [#3300](https://github.com/rollup/rollup/pull/3300): Add note about setting `types` in tsconfig file (@tjenkinson)
- [#3303](https://github.com/rollup/rollup/pull/3303): Use ! to assert not-null in TypeScript (@NotWoods)
- [#3312](https://github.com/rollup/rollup/pull/3312): Implement stdin input (@lukastaegert)
- [#3318](https://github.com/rollup/rollup/pull/3318): Update magic-string and other dependencies (@lukastaegert)

## 1.27.14

_2019-12-22_

### Bug Fixes

- Update references to official rollup plugins in error messages (#3297, #3298)

### Pull Requests

- [#3286](https://github.com/rollup/rollup/pull/3286): Update link to JavaScript API documentation (@romankaravia)
- [#3294](https://github.com/rollup/rollup/pull/3294): Update deprecated references to the node-resolve plugin in the documentation (@Vlad-Shcherbina)
- [#3297](https://github.com/rollup/rollup/pull/3297): Update references to rollup-plugin-json (@cprecioso)
- [#3298](https://github.com/rollup/rollup/pull/3298): Update references to official rollup plugins (@cprecioso)

## 1.27.13

_2019-12-14_

### Bug Fixes

- Do not truncate environment variable values at the first colon when using the `--environment` option (#3283)

### Pull Requests

- [#3283](https://github.com/rollup/rollup/pull/3283): Allow environment variables to contain colons (@tlaverdure)

## 1.27.12

_2019-12-13_

### Bug Fixes

- Prevent invalid AMD or SystemJS code when accessing `import.meta` (#3282)

### Pull Requests

- [#3282](https://github.com/rollup/rollup/pull/3282): Always make "module" available for SystemJS and AMD formats if `import.meta` is accessed directly (@lukastaegert)

## 1.27.11

_2019-12-12_

### Bug Fixes

- Resolve a crash due to an infinite loop (#3280)

### Pull Requests

- [#3280](https://github.com/rollup/rollup/pull/3280): Prevent infinite deoptimizations (@lukastaegert)

## 1.27.10

_2019-12-11_

### Bug Fixes

- Keep track of function return values in more situations (#3278)

### Pull Requests

- [#3278](https://github.com/rollup/rollup/pull/3278): Avoid some unnecessary value tracking deoptimizations ( @lukastaegert)

## 1.27.9

_2019-12-07_

### Bug Fixes

- Fix an issue where reexports could be missing when preserving modules (#3273)
- Allow turning of color output via NO_COLOR or FORCE_COLOR=0 environment variables (#3272)

### Pull Requests

- [#3272](https://github.com/rollup/rollup/pull/3272): Support either NO_COLOR or FORCE_COLOR=0 to turn off color ( @kikonen)
- [#3273](https://github.com/rollup/rollup/pull/3273): Make sure that indirectly reexported modules also become chunk dependencies when preserving modules(@lukastaegert)

## 1.27.8

_2019-12-02_

### Bug Fixes

- Deoptimize objects when a method is called on them to make sure modifications via "this" are observed (#3266)

### Pull Requests

- [#3266](https://github.com/rollup/rollup/pull/3266): Workaround for various object literal mutation bugs (@kzc)

## 1.27.7

_2019-12-01_

### Bug Fixes

- Fix a scenario where a reassignments to computed properties were not tracked (#3267)

### Pull Requests

- [#3267](https://github.com/rollup/rollup/pull/3267): Fix incomplete computed property deoptimization (@lukastaegert)

## 1.27.6

_2019-11-30_

### Bug Fixes

- Use "auto" export mode by default for all modules when preserving modules (#3265)
- Observe "output.exports" when preserving modules and warn for mixed exports if necessary (#3265)

### Pull Requests

- [#3265](https://github.com/rollup/rollup/pull/3265): Use export mode "auto" by default when preserving modules ( @lukastaegert)

## 1.27.5

_2019-11-25_

### Bug Fixes

- Make sure namespaces for inlined dynamic imports are treated as variable accesses when deconflicting (#3256)

### Pull Requests

- [#3256](https://github.com/rollup/rollup/pull/3256): Avoid name conflicts when inlining dynamic imports nested in functions (@lukastaegert)
- [#3257](https://github.com/rollup/rollup/pull/3257): Update dependencies (@lukastaegert)

## 1.27.4

_2019-11-22_

### Bug Fixes

- Aggregate circular dependency warnings in the CLI (#3249)
- Do not defer non-aggregated handlers in the CLI (#3249)

### Pull Requests

- [#3249](https://github.com/rollup/rollup/pull/3249): Fix broken Windows CLI tests (@lukastaegert)
- [#3251](https://github.com/rollup/rollup/pull/3251): Add installation as a separate header (@ashrith-kulai)

## 1.27.3

_2019-11-20_

### Bug Fixes

- Provide better warning when empty chunks are created in a code-splitting scenario (#3244)

### Pull Requests

- [#3244](https://github.com/rollup/rollup/pull/3244): Clearer empty chunk warning (@tjenkinson)

## 1.27.2

_2019-11-18_

### Bug Fixes

- Fix an issue where live bindings were not working correctly when using `+=` in SystemJS (#3242)

### Pull Requests

- [#3242](https://github.com/rollup/rollup/pull/3242): Export updated assignments when using shorthand update assignment expressions in SystemJS (@lukastaegert)

## 1.27.1

_2019-11-18_

### Bug Fixes

- Fix an issue where code after a switch-statement with removed cases was erroneously not included (#3241)

### Pull Requests

- [#3237](https://github.com/rollup/rollup/pull/3237): make `acornOptions` optional in `parse()` in docs (@tjenkinson)
- [#3240](https://github.com/rollup/rollup/pull/3240): Update dependencies and fix vulnerability (@lukastaegert)
- [#3241](https://github.com/rollup/rollup/pull/3241): Do not truncate after switch-statement with removed case ( @lukastaegert)

## 1.27.0

_2019-11-12_

### Features

- Add support for output-specific plugins (#3218)
- Reenable parallel output processing when using the CLI (#3218)
- Warn if files are emitted that would overwrite previously emitted files (#3218)

### Bug Fixes

- Do not overwrite files emitted in other builds if outputs are generated in parallel (#3218)

### Pull Requests

- [#3218](https://github.com/rollup/rollup/pull/3218): Per output plugins (@lukastaegert)

## 1.26.5

_2019-11-11_

### Bug Fixes

- Fix a regression where it was no longer to pass a certain option format to generate (#3223)

### Pull Requests

- [#3223](https://github.com/rollup/rollup/pull/3223): Allow passing input options to output (@lukastaegert)

## 1.26.4

_2019-11-09_

### Bug Fixes

- Keep watching known files after a plugin error during the initial build (#3219)

### Pull Requests

- [#3216](https://github.com/rollup/rollup/pull/3216): Fix small typo (@kaisermann)
- [#3217](https://github.com/rollup/rollup/pull/3217): Update dependencies and fix security vulnerability ( @lukastaegert)
- [#3219](https://github.com/rollup/rollup/pull/3219): Also recover from plugin errors during the initial build ( @lukastaegert)

## 1.26.3

_2019-11-02_

### Bug Fixes

- Work around an incompatibility with rollup-plugin-dts (#3211)

### Pull Requests

- [#3211](https://github.com/rollup/rollup/pull/3211): Do no fail if the source attribute is `undefined` in an unused named export (@lukastaegert)

## 1.26.2

_2019-10-31_

### Bug Fixes

- Do not create invalid code when using `treeshake: false` and star re-exports (#3209)

### Pull Requests

- [#3209](https://github.com/rollup/rollup/pull/3209): Also remove export-all declarations when not tree-shaking ( @lukastaegert)

## 1.26.1

_2019-10-31_

### Bug Fixes

- Prevent an issue where outputs would overwrite files emitted by other outputs (#3201)
- Do not throw an error if the config file does not have a .js extension (#3204)

### Pull Requests

- [#3201](https://github.com/rollup/rollup/pull/3201): Make the CLI run generate/output in serial (@marijnh)
- [#3204](https://github.com/rollup/rollup/pull/3204): support all config file extensions (.js,.mjs,...) (@arlac77)

## 1.26.0

_2019-10-27_

### Features

- Only warn when no output is provided for an IIFE bundle but still produce valid code (#3181)
- Support reexporting namespaces as a binding (#3193)
- Switch from hash.js to crypto for hashing in the Node build for better performance and support for very large assets ( #3194)

### Bug Fixes

- Correctly handle chunks reexporting the same namespace as two different bindings (#3193)

### Pull Requests

- [#3181](https://github.com/rollup/rollup/pull/3181): Remove the need to provide an output name for IIFE bundles ( @bterrier)
- [#3193](https://github.com/rollup/rollup/pull/3193): Add support for "export \* as name from …" (@lukastaegert)
- [#3194](https://github.com/rollup/rollup/pull/3194): Add support for large assets (> 100 MB) (@SebastianNiemann)

## 1.25.2

_2019-10-23_

### Bug Fixes

- Improve performance of bundled UMD code by adding additional parentheses to enforce eager parsing (#3183)
- Improve types to tolerate passing a Rollup config with multiple outputs to `rollup.rollup` (#3184)

### Pull Requests

- [#3183](https://github.com/rollup/rollup/pull/3183): Add parentheses to factory function of UMD bundles (@ajihyf)
- [#3184](https://github.com/rollup/rollup/pull/3184): RollupOptions accept output as array (@imcotton)

## 1.25.1

_2019-10-20_

### Bug Fixes

- Handle a situation where code was not included after a switch statement (#3178)
- Handle a situation where code was not included after a do-while loop (#3180)
- Do not fail if different outputs emit the same file (#3175)
- Give access to the original acorn error for parse errors (#3176)

### Pull Requests

- [#3175](https://github.com/rollup/rollup/pull/3175): Disable errors for duplicate emitted file names (@marijnh)
- [#3176](https://github.com/rollup/rollup/pull/3176): Add original parser error to rollup error; Update tests ( @gribnoysup)
- [#3178](https://github.com/rollup/rollup/pull/3178): Fix switch case not being included correctly (@lukastaegert)
- [#3179](https://github.com/rollup/rollup/pull/3179): Update dependencies (@lukastaegert)
- [#3180](https://github.com/rollup/rollup/pull/3180): Handle conditional breaks in do-while loops with unconditional return (@lukastaegert)

## 1.25.0

_2019-10-18_

### Features

- Remove try-catch if there is no side-effect in the try-block (#3166)
- Omit side-effect-free trailing cases in switch-statements (#3166)
- Remove unused labels (#3170)

### Bug Fixes

- Do not remove code after labeled statements that contain a throw or return if the label is used (#3170)
- Prevent invalid code when expressions are simplified that do not follow a white-space character (#3173)
- Do not remove continue statements inside switch statements (#3166)
- Prevent trailing empty lines when tree-shaking inside switch statements (#3166)

### Pull Requests

- [#3166](https://github.com/rollup/rollup/pull/3166): Better try statement tree shaking (@lukastaegert)
- [#3170](https://github.com/rollup/rollup/pull/3170): Handle optional control flow in labeled statements, remove unused labels (@lukastaegert)
- [#3173](https://github.com/rollup/rollup/pull/3173): Add missing spaces in certain statements and expressions to avoid invalid code (@lukastaegert)

## 1.24.0

_2019-10-15_

### Features

- Respect `break`, `continue`, `return` and `throw` when tree-shaking to detect dead code (#3153)
- Do treat treat hoisted function declarations as "unknown" when checking for call side-effects (#3153)

### Bug Fixes

- Make sure that unknown `import.meta` properties produce valid code in SystemJS (#3152)
- Make sure `treeshake.annotations: false` is respected for class instantiation (#3153)
- Check property access side-effects for class instantiation (#3153)
- Do not suppress break statements inside labeled statements (#3153)

### Pull Requests

- [#3152](https://github.com/rollup/rollup/pull/3152): Allow import.meta.\* for systemjs format (@dmail)
- [#3153](https://github.com/rollup/rollup/pull/3153): Get rid of immutable.js and implement tree-shaking for broken control flow (@lukastaegert)

## 1.23.1

_2019-10-05_

### Bug Fixes

- Fix a regression where the node types had a specific minimal version (#3143)

### Pull Requests

- [#3143](https://github.com/rollup/rollup/pull/3143): Ensure that types packages have star version ranges ( @lukastaegert)

## 1.23.0

_2019-10-03_

### Features

- Add placeholders for extensions when preserving modules (#3116)

### Pull Requests

- [#3116](https://github.com/rollup/rollup/pull/3116): Include extensions in preserveModules output filenames for scriptified assets (@Andarist)
- [#3142](https://github.com/rollup/rollup/pull/3142): Fix typo (@tu4mo)

## 1.22.0

_2019-09-29_

### Features

- Add a new "hidden" sourcemap type that generates the map files but omits the sourcemap comment (#3120)
- Generate more efficient code when using `namespaceToStringTag: true` (#3135)
- Make sure namespace objects do not have a prototype (#3136)

### Bug Fixes

- Do not ignore side-effectful iterators by always preserving for..of loops for now (#3132)
- Make sure `--context` is observed as a CLI option (#3134)
- Do not require specific versions for @types dependencies (#3131)

### Pull Requests

- [#3120](https://github.com/rollup/rollup/pull/3120): Generate sourcemaps but omit the comment (@rohitmohan96)
- [#3131](https://github.com/rollup/rollup/pull/3131): Use asterisk for @types/\* dependencies (@frenzzy)
- [#3132](https://github.com/rollup/rollup/pull/3132): Preserve empty for...of loops (@imatlopez)
- [#3133](https://github.com/rollup/rollup/pull/3133): Update dependencies (@lukastaegert)
- [#3134](https://github.com/rollup/rollup/pull/3134): Wire up --context CLI flag (@tchetwin)
- [#3135](https://github.com/rollup/rollup/pull/3135): Remove Symbol polyfill in module namespaces (@mkubilayk)
- [#3136](https://github.com/rollup/rollup/pull/3136): Set null prototype on namespace objects (@rpamely)

## 1.21.4

_2019-09-16_

### Bug Fixes

- Recognize common browser globals (#3117)
- Do not treat "typeof <global>" as a side-effect (#3117)

### Pull Requests

- [#3117](https://github.com/rollup/rollup/pull/3117): Add browser globals to known globals and prevent "typeof" side-effects (@lukastaegert)

## 1.21.3

_2019-09-14_

### Bug Fixes

- Fix a regression where modifying a watched file did not trigger a rebuild (#3112)

### Pull Requests

- [#3112](https://github.com/rollup/rollup/pull/3112): Fix .addWatchFile() dependencies failing to invalidate in watch mode (@tivac)

## 1.21.2

_2019-09-09_

### Bug Fixes

- Fix wrong deprecation message to direct to `this.emitFile` instead of `this.emitAsset`

## 1.21.1

_2019-09-09_

### Bug Fixes

- Allow legacy plugins to still add assets directly to the bundle object (#3105)

### Pull Requests

- [#3105](https://github.com/rollup/rollup/pull/3105): Allow legacy plugins to still add assets directly to the bundle object (@lukastaegert)

## 1.21.0

_2019-09-08_

### Features

- Respect `output.entryFileNames` when preserving modules (#3088)
- Make accessing unknown globals a side-effect unless this is deactivated via `treeshake.unknownGlobalSideEffects` ( #3068)
- Respect global objects when checking for pure global functions (#3068)
- Introduce a `type` to more easily distinguish chunks and assets in the output bundle (#3080)

### Bug Fixes

- Recover in watch mode when the initial build fails (#3081)
- Make sure `output.strict` is respected for SystemJS output (#3101)

### Pull Requests

- [#3068](https://github.com/rollup/rollup/pull/3068): Make accessing unknown globals a side-effect (@lukastaegert)
- [#3080](https://github.com/rollup/rollup/pull/3080): OutputBundle Tagged union with 'type = chunk|asset' (@askbeka)
- [#3081](https://github.com/rollup/rollup/pull/3081): Watch files onbuild, even if build fails (@mhkeller)
- [#3088](https://github.com/rollup/rollup/pull/3088): Add support for entryFileNames pattern used in combination with preserveModules option (@Andarist)
- [#3101](https://github.com/rollup/rollup/pull/3101): Remove 'use strict'; from systemjs when strict=false (@askbeka)

## 1.20.3

_2019-08-28_

### Bug Fixes

- Make sure file hashes change when a change of the naming pattern leads to a file name change of a dependency (#3083)
- Fix several issues where reexporting an external "default" export could lead to invalid or incorrect code (#3084)

### Pull Requests

- [#3078](https://github.com/rollup/rollup/pull/3078): Add github actions workflow config for windows (@shellscape)
- [#3083](https://github.com/rollup/rollup/pull/3083): Properly reflect dependency file names in hash (@lukastaegert)
- [#3084](https://github.com/rollup/rollup/pull/3084): Fix "default" reexport issues in non ESM/System formats ( @lukastaegert)

## 1.20.2

_2019-08-25_

### Bug Fixes

- Avoid an issue where circular namespace reexports would crash Rollup (#3074)

### Pull Requests

- [#3077](https://github.com/rollup/rollup/pull/3077): Handle namespaces that reexport themselves (@lukastaegert)

## 1.20.1

_2019-08-22_

### Bug Fixes

- Fix an issue where variable names inside dynamic import expressions were not rendered correctly (#3073)
- Fix type definition to allow a single watcher config as well as an array (#3074)

### Pull Requests

- [#3073](https://github.com/rollup/rollup/pull/3073): Fix wrong variable name in import expression (@lukastaegert)
- [#3074](https://github.com/rollup/rollup/pull/3074): Fixes type definition on watch and Watcher constructor ( @MicahZoltu)

## 1.20.0

_2019-08-21_

### Features

- Add augmentChunkHash plugin hook to be able to reflect changes in renderChunk in the chunk hash (#2921)

### Bug Fixes

- Do not mutate the acorn options object (#3051)
- Make sure the order of emitted chunks always reflects the order in which they were emitted (#3055)
- Do not hang when there are strings containing comment-like syntax in some scenarios (#3069)

### Pull Requests

- [#2921](https://github.com/rollup/rollup/pull/2921): Add augmentChunkHash plugin hook (@isidrok)
- [#2995](https://github.com/rollup/rollup/pull/2995): Add info on installing locally to docs (@mesqueeb)
- [#3037](https://github.com/rollup/rollup/pull/3037): Refresh pull request labels (@shellscape)
- [#3048](https://github.com/rollup/rollup/pull/3048): Document ROLLUP_WATCH environment variable (@shellscape)
- [#3051](https://github.com/rollup/rollup/pull/3051): Avoid changes to the original options (.acorn) object ( @LongTengDao)
- [#3052](https://github.com/rollup/rollup/pull/3052): Minor refactoring: Remove one try-catch (@KSXGitHub)
- [#3053](https://github.com/rollup/rollup/pull/3053): Refactor to use async-await in more places (@KSXGitHub)
- [#3055](https://github.com/rollup/rollup/pull/3055): Provide consistent chunking via a consistent order of entry modules when emitting chunks (@lukastaegert)
- [#3058](https://github.com/rollup/rollup/pull/3058): Remove acorn-bigint and acorn-dynamic-import from bundle ( @LongTengDao)
- [#3061](https://github.com/rollup/rollup/pull/3061): Update to acorn@7 (@lukastaegert)
- [#3063](https://github.com/rollup/rollup/pull/3063): Auto-generate license file (@lukastaegert)
- [#3069](https://github.com/rollup/rollup/pull/3069): Prevent infinite loop when scanning for line-breaks and there are comment-like strings (@lukastaegert)

## 1.19.4

_2019-08-07_

### Bug Fixes

- Prevent invalid code when exporting an external namespace (#3034)
- Prevent invalid or non-equivalent code when simplifying expressions in return and throw statements (#3035)

### Pull Requests

- [#3034](https://github.com/rollup/rollup/pull/3034): Avoid generating .\* as export (@LongTengDao)
- [#3035](https://github.com/rollup/rollup/pull/3035): Prevent ASI errors for conditional expressions (@lukastaegert)
- [#3036](https://github.com/rollup/rollup/pull/3036): Fix documents to use https, not http (@giraffate)

## 1.19.3

_2019-08-06_

### Bug Fixes

- Fix wrong URLs in error messages (#3033)

### Pull Requests

- [#3033](https://github.com/rollup/rollup/pull/3033): Fix wrong URLs in error messages (@giraffate)

## 1.19.2

_2019-08-05_

### Bug Fixes

- Add bin file to package

## 1.19.1

_2019-08-05_

### Bug Fixes

- Remove wrong extension in package.json file (#3031)

### Pull Requests

- [#3031](https://github.com/rollup/rollup/pull/3031): Fix wrong extension (@lukastaegert)

## 1.19.0

_2019-08-05_

### Features

- Implement a new unified file emission API for assets and chunks with support for explicit file names (#2999)
- Use the id of the last module in a chunk as base for the chunk name if no better name is available (#3025)
- Use the id of the last module in a chunk as base for the variable name of a chunk in some formats if no better name is available (#2999)

### Bug Fixes

- Do not produce invalid variable names if an empty name is chosen for a virtual module (#3026)
- Fix an issue where a module variable name would conflict with a local variable name in some formats (#3020)

### Pull Requests

- [#2999](https://github.com/rollup/rollup/pull/2999): Unified file emission api (@lukastaegert)
- [#3020](https://github.com/rollup/rollup/pull/3020): Switch to a code-splitting build and update dependencies ( @lukastaegert)
- [#3025](https://github.com/rollup/rollup/pull/3025): Use id of last module in chunk as name base for auto-generated chunks (@lukastaegert)
- [#3026](https://github.com/rollup/rollup/pull/3026): Avoid variable from empty module name be empty (@LongTengDao)

## 1.18.0

_2019-08-01_

### Features

- Add `externalLiveBindings: false` option to optimize code when live bindings are not needed (#3010)

### Pull Requests

- [#2997](https://github.com/rollup/rollup/pull/2997): Integrate coverage into CI setup (@lukastaegert)
- [#2998](https://github.com/rollup/rollup/pull/2998): Update readme badges (@lukastaegert)
- [#3010](https://github.com/rollup/rollup/pull/3010): Add option to prevent code for external live bindings ( @lukastaegert)

## 1.17.0

_2019-07-15_

### Features

- Allow plugins to access current combined sourcemap in transform hook for coverage instrumentation (#2993)

### Pull Requests

- [#2987](https://github.com/rollup/rollup/pull/2987): Fix code fences for link (@johanholmerin)
- [#2989](https://github.com/rollup/rollup/pull/2989): Bump lodash from 4.17.11 to 4.17.14 (@dependabot)
- [#2993](https://github.com/rollup/rollup/pull/2993): Add getCombinedSourceMap in transform plugin context (@billowz)

## 1.16.7

_2019-07-09_

### Bug Fixes

- Fix an issue where exported import.meta properties would lead to invalid code (#2986)

### Pull Requests

- [#2985](https://github.com/rollup/rollup/pull/2985): Improve sourcemap types (@jridgewell)
- [#2986](https://github.com/rollup/rollup/pull/2986): Only overwrite content when resolving import.meta properties ( @lukastaegert)

## 1.16.6

_2019-07-04_

### Bug Fixes

- Do not pass undefined to resolveDynamicImport for unresolvable template literals (#2984)

### Pull Requests

- [#2984](https://github.com/rollup/rollup/pull/2984): Always forward AST nodes for unresolvable dynamic imports ( @lukastaegert)

## 1.16.5

_2019-07-04_

### Bug Fixes

- onwarn should still be called when --silent is used (#2982)
- Properly clean up watchers for files that are deleted between builds (#2982)

### Pull Requests

- [#2981](https://github.com/rollup/rollup/pull/2981): Do not skip onwarn handler when --silent is used (@lukastaegert)
- [#2982](https://github.com/rollup/rollup/pull/2982): Make tests run on Node 12, fix watcher cleanup issue ( @lukastaegert)

## 1.16.4

_2019-07-02_

### Bug Fixes

- Do not show a TypeScript error when providing a location as number to this.warn and this.error (#2974)
- Use the correct TypeScript type for Sourcemap.version (#2976)

### Pull Requests

- [#2965](https://github.com/rollup/rollup/pull/2965): Use async readFile in getRollupDefaultPlugin (@kaksmet)
- [#2974](https://github.com/rollup/rollup/pull/2974): Align TS types, docs and implementation for this.warn and this.error (@lukastaegert)
- [#2976](https://github.com/rollup/rollup/pull/2976): Fix sourcemap type and update dependencies (@lukastaegert)

## 1.16.3

_2019-06-29_

### Bug Fixes

- Prevent name conflicts with unused function parameters (#2972)

### Pull Requests

- [#2972](https://github.com/rollup/rollup/pull/2972): Deconflict unused parameters (@lukastaegert)

## 1.16.2

_2019-06-22_

### Bug Fixes

- Properly wrap dynamic imports in Promises that can be caught when generating CJS output (#2958)

### Pull Requests

- [#2958](https://github.com/rollup/rollup/pull/2958): Make sure errors from dynamic imports can be caught ( @lukastaegert)

## 1.16.1

_2019-06-21_

### Pull Requests

- [#2956](https://github.com/rollup/rollup/pull/2956): Add missing CLI docs for strictDeprecations (@lukastaegert)

## 1.16.0

_2019-06-21_

### Features

- Add strictDeprecations option to throw when currently or upcoming deprecated features are used (#2945)
- Keep annotations and comments when simplifying logical and conditional expressions (#2955)

### Bug Fixes

- Generate proper namespace objects when dynamically importing external dependencies for AMD or CJS formats (#2954)
- Fix dynamically imported variables not being resolved correctly when importing from an entry chunk with only a default export (#2954)
- Do not reexport default when reexporting a namespace (#2954)

### Pull Requests

- [#2945](https://github.com/rollup/rollup/pull/2945): Add option to handle use of features marked for deprecation as errors (@lukastaegert)
- [#2954](https://github.com/rollup/rollup/pull/2954): Improve dynamic import interop (@lukastaegert)
- [#2955](https://github.com/rollup/rollup/pull/2955): Keep annotations and comments when simplifying logical and conditional expressions (@lukastaegert)

## 1.15.6

_2019-06-16_

### Bug Fixes

- No longer use an alternate screen in watch mode to allow scrolling (#2942)
- Prioritize non-external imports over external ones when resolving conflicting namespace re-exports (#2893)

### Pull Requests

- [#2893](https://github.com/rollup/rollup/pull/2893): Improve handling of conflicting namespace exports (@aleclarson)
- [#2942](https://github.com/rollup/rollup/pull/2942): Get rid of alternate screen and simplify screen clearing ( @lukastaegert)

## 1.15.5

_2019-06-14_

### Bug Fixes

- Do not include any comments for completely tree-shaken files so that `renderedLength === 0` is a reliable check ( #2940)
- Do not cause type errors when returning `null` from `resolveId` (#2941)

### Pull Requests

- [#2940](https://github.com/rollup/rollup/pull/2940): Completely omit files that do not have any included statements ( @lukastaegert)
- [#2941](https://github.com/rollup/rollup/pull/2941): Explicitly allow null as return value for various hooks ( @lukastaegert)

## 1.15.4

_2019-06-14_

### Bug Fixes

- Improve how asset and chunk URLs are resolved for UMD, IIFE and CJS output (#2937)

### Pull Requests

- [#2937](https://github.com/rollup/rollup/pull/2937): Fix URL resolution to work when the current script contains query parameters (@lukastaegert)

## 1.15.3

_2019-06-13_

### Bug Fixes

- Always reemit assets and chunks from cached transform hooks (#2936)

### Pull Requests

- [#2936](https://github.com/rollup/rollup/pull/2936): Fix repeated re-emission of files emitted from a transform hook ( @lukastaegert)

## 1.15.2

_2019-06-13_

### Bug Fixes

- Make sure chunks emitted from transform hooks are also emitted for incremental builds in watch mode (#2933)

### Pull Requests

- [#2933](https://github.com/rollup/rollup/pull/2933): Reemit chunks emitted from transform hooks (@lukastaegert)

## 1.15.1

_2019-06-11_

### Bug Fixes

- Do not fail when reexporting variables in dynamic entry points from other chunks (#2928)

### Pull Requests

- [#2928](https://github.com/rollup/rollup/pull/2928): Handle reexports from dynamic entries across chunk ( @lukastaegert)

## 1.15.0

_2019-06-11_

### Features

- Tone down try-catch deoptimization while maintaining polyfill support (#2918)

### Bug Fixes

- Handle feature detection with "typeof" for regular expressios (#2916)
- Deoptimize `'' + variable'` type coercion as expression statement for feature detection (#2917)
- Always observe argument side-effects when tree-shaking (#2924)

### Pull Requests

- [#2916](https://github.com/rollup/rollup/pull/2916): Deoptimize typeof for regular expression literals to better support es6-shim (@lukastaegert)
- [#2917](https://github.com/rollup/rollup/pull/2917): Support implicit type coercion errors in es5-shim (@lukastaegert)
- [#2918](https://github.com/rollup/rollup/pull/2918): Deoptimize try-catch less radically (@lukastaegert)
- [#2924](https://github.com/rollup/rollup/pull/2924): Do not tree-shake arguments with side-effects (@lukastaegert)

## 1.14.6

_2019-06-10_

### Bug Fixes

- Fix an issue where call arguments were not included in try statements (#2914)

### Pull Requests

- [#2914](https://github.com/rollup/rollup/pull/2914): Properly include try statements for each pass when deoptimization is deactivated (@lukastaegert)

## 1.14.5

_2019-06-09_

### Bug Fixes

- Keep external ids unmodified when using the object form of resolveId (#2907)
- Cache dynamic import resolutions when using Rollup cache (#2908)
- Keep all necessary parentheses when tree-shaking call arguments (#2911)

### Pull Requests

- [#2906](https://github.com/rollup/rollup/pull/2906): Update dependencies (@lukastaegert)
- [#2907](https://github.com/rollup/rollup/pull/2907): Do not renormalize external ids when using the object form ( @lukastaegert)
- [#2908](https://github.com/rollup/rollup/pull/2908): Cache dynamic ids if possible (@lukastaegert)
- [#2911](https://github.com/rollup/rollup/pull/2911): Fix treeshaken parameters around parentheses (@manucorporat)

## 1.14.4

_2019-06-07_

### Bug Fixes

- Do not omit external re-exports for `moduleSideEffects: false` (#2905)

### Pull Requests

- [#2905](https://github.com/rollup/rollup/pull/2905): Make sure external re-exports are included for moduleSideEffects: false (@lukastaegert)

## 1.14.3

_2019-06-06_

### Bug Fixes

- Generate correct external imports when importing from a directory that would be above the root of the current working directory (#2902)

### Pull Requests

- [#2902](https://github.com/rollup/rollup/pull/2902): Use browser relative path algorithm for chunks (@lukastaegert)

## 1.14.2

_2019-06-05_

### Bug Fixes

- Prevent unnecessary inclusion of external namespace import in certain situations (#2900)

### Pull Requests

- [#2900](https://github.com/rollup/rollup/pull/2900): Handle early bind for member expressions (@lukastaegert)

## 1.14.1

_2019-06-05_

### Bug Fixes

- Fix an issue where try-statements were not included properly when a variable declared inside the statement was accessed outside it (#2898)
- Fix an issue where `await` expressions were not included properly (#2899)

### Pull Requests

- [#2898](https://github.com/rollup/rollup/pull/2898): Properly include try-catch-statements even if they have already been included in some way (@lukastaegert)
- [#2899](https://github.com/rollup/rollup/pull/2899): Fix unintended early return in await inclusion handling ( @lukastaegert)

## 1.14.0

_2019-06-05_

### Features

- Deoptimize code inside and called from try-statements for feature detection (#2892)
- Tree-shake unused call arguments (#2892)

### Pull Requests

- [#2892](https://github.com/rollup/rollup/pull/2892): Implement try-statement-deoptimization for feature detection, tree-shake unused arguments (@lukastaegert)

## 1.13.1

_2019-06-01_

### Bug Fixes

- Avoid conflicts between top-level module, require etc. and CommonJS runtimes (#2889)

### Pull Requests

- [#2888](https://github.com/rollup/rollup/pull/2888): Enable full TypeScript strict mode (@lukastaegert)
- [#2889](https://github.com/rollup/rollup/pull/2889): Protect all module globals for CJS output from being redefined ( @lukastaegert)

## 1.13.0

_2019-05-31_

### Features

- Omit `exports` and `module` from SystemJS wrapper if possible (#2880)
- Try to use the first letters of names when mangling exports (#2885)

### Bug Fixes

- Avoid conflicts with local variables when using format specific globals to render dynamic imports and file URLs ( #2880)
- Do not produce undefined reexports when reexporting from entry points (#2885)

### Pull Requests

- [#2880](https://github.com/rollup/rollup/pull/2880): Deconflict global variables used inside format-specific code ( @lukastaegert)
- [#2885](https://github.com/rollup/rollup/pull/2885): Do not produce undefined reexports when reexporting from entry points and refactor chunk linking (@lukastaegert)

## 1.12.5

_2019-05-30_

### Pull Requests

- [#2884](https://github.com/rollup/rollup/pull/2884): Update pluginutils for new micormatch and reduced bundle size ( @lukastaegert)

## 1.12.4

_2019-05-27_

### Bug Fixes

- Show correct error stack trace for errors throw in "load" hooks (#2871)

### Pull Requests

- [#2875](https://github.com/rollup/rollup/pull/2875): Mention subfolders in docs (@lukastaegert)
- [#2871](https://github.com/rollup/rollup/pull/2871): Reserve error stack information (@LongTengDao)

## 1.12.3

_2019-05-19_

### Bug Fixes

- Prevent duplicate imports when exports are reexported as default exports (#2866)

### Pull Requests

- [#2755](https://github.com/rollup/rollup/pull/2755): Enable TypeScript strictNullChecks (@edsrzf)
- [#2866](https://github.com/rollup/rollup/pull/2866): Properly deduplicate reexported default exports (@lukastaegert)

## 1.12.2

_2019-05-17_

### Bug Fixes

- Do not fail when using clearScreen:false in watchMode (#2858)
- Properly resolve star reexports when preserving modules (#2860)

### Pull Requests

- [#2858](https://github.com/rollup/rollup/pull/2858): Declare processConfigsErr before use (@humphd)
- [#2860](https://github.com/rollup/rollup/pull/2860): Keep nested exports with preserveModules (@TomCaserta)
- [#2864](https://github.com/rollup/rollup/pull/2864): Cache transitive reexport detection (@lukastaegert)

## 1.12.1

_2019-05-16_

### Bug Fixes

- Extend file name sanitation to also replace "?" and "\*" e.g. when preserving modules with the updated commonjs plugin (#2860)
- Do not ignore module transformer that return an empty string (#2861)

### Pull Requests

- [#2860](https://github.com/rollup/rollup/pull/2860): Update to latest plugins and extend file name sanitation ( @lukastaegert)
- [#2861](https://github.com/rollup/rollup/pull/2861): Allow transformers to return an empty string (@lukastaegert)

## 1.12.0

_2019-05-15_

### Features

- Add `treeshake.moduleSideEffects` option to allow removing empty imports without a side-effect check (#2844)
- Extend plugin API to allow marking modules as side-effect-free (#2844)
- Extend `this.resolve` plugin context function with an option to skip the `resolveId` hook of the calling plugin ( #2844)
- Add `isEntry` flag to `this.getModuleInfo` plugin context function (#2844)
- Distribute Rollup as optimized ES2015 code (#2851)

### Pull Requests

- [#2844](https://github.com/rollup/rollup/pull/2844): Add options and hooks to control module side effects ( @lukastaegert)
- [#2851](https://github.com/rollup/rollup/pull/2851): Switch to ES2015 output (@lukastaegert)

## 1.11.3

_2019-05-05_

### Bug Fixes

- Quote es3 keywords in namespace objects (#2825)

### Pull Requests

- [#2825](https://github.com/rollup/rollup/pull/2825): Add es3 support for namespace object import (@sormy)

## 1.11.2

_2019-05-04_

### Bug Fixes

- Prevent a crash when handling circular namespace exports (#2836)

### Pull Requests

- [#2836](https://github.com/rollup/rollup/pull/2836): Make sure circular `export * from X` does not stack overflow ( @Swatinem)

## 1.11.1

_2019-05-04_

### Bug Fixes

- Fix an issue where rendered exports were reported as "removed" in the bundle information (#2835)

### Pull Requests

- [#2835](https://github.com/rollup/rollup/pull/2835): Fix `removedExports` to correctly track the exported item ( @Swatinem)

## 1.11.0

_2019-05-03_

### Features

- Add `emitChunk` plugin context function to emit additional entry chunks that can be referenced from the code (#2809)
- Allow `manualChunks` to be a function (#2831)
- Omit `.js` extensions in AMD imports to make sure an AMD `baseUrl` would work (#2809)
- Automatically use the name of the imported module as a base for dynamically imported chunks (#2809)
- Add `resolveFileUrl` plugin hook to replace `resolveAssetUrl` and handle emitted chunks as well (#2809)
- Add `resolve` plugin hook to replace `resolveId` and `isExternal` that returns an object (#2829)
- Allow `resolveDynamicImport` to return an `{id, external}` object to also resolve unresolvable dynamic imports to a module (#2829)

### Bug Fixes

- Do not create invalid code if a dynamic import contains nothing but reexports (#2809)
- Do not fail if modules that define a manual chunk depend on each other (#2809)
- Do not fail if a module that defines a manual chunk is the dependency of a module defining a different manual chunk ( #2809)
- No longer fail for unnamed duplicate entry points but combine them (#2809)
- Always return `string | null` from `this.resolveId` even if some `resolveId` hooks return objects (#2829)
- Show proper warnings when `resolveDynamicImport` resolves to a non-external module that does not exist (#2829)

### Pull Requests

- [#2809](https://github.com/rollup/rollup/pull/2809): Add hook for dynamic entry chunk emission (@lukastaegert)
- [#2821](https://github.com/rollup/rollup/pull/2821): Fix syntax error in documentation (@FFxSquall)
- [#2829](https://github.com/rollup/rollup/pull/2829): Improve id resolution (@lukastaegert)
- [#2831](https://github.com/rollup/rollup/pull/2831): Allow manualChunks to be a function (@lukastaegert)
- [#2832](https://github.com/rollup/rollup/pull/2832): Improve `generateBundle` documentation (@lukastaegert)
- [#2833](https://github.com/rollup/rollup/pull/2833): Update dependencies (@lukastaegert)

## 1.10.1

_2019-04-19_

### Bug Fixes

- Invalid options.format values will now trigger a helpful error (#2813)

### Pull Requests

- [#2812](https://github.com/rollup/rollup/pull/2812): Minor documentation update (@dnalborczyk)
- [#2813](https://github.com/rollup/rollup/pull/2813): Catch invalid options.format values (@marijnh)
- [#2816](https://github.com/rollup/rollup/pull/2816): Update all dependencies to fix security issues (@lukastaegert)

## 1.10.0

_2019-04-11_

### Features

- Improve generated code to polyfill `import.meta.url` (#2785)
- Add plugin hook to configure handling of `import.meta` (#2785)
- Improve generated code when accessing URLs of emitted assets (#2796)
- Add plugin hook to configure the generated code when accessing URLs of emitted assets (#2796)

### Bug Fixes

- No longer resolve assets to their parent URL in some cases (#2796)

### Pull Requests

- [#2785](https://github.com/rollup/rollup/pull/2785): Refactor handling of import.meta.url and add option to configure behaviour (@lukastaegert)
- [#2796](https://github.com/rollup/rollup/pull/2796): Improve and fix asset emission (@lukastaegert)

## 1.9.3

_2019-04-10_

### Bug Fixes

- Simplify return expressions that are evaluated before the surrounding function is bound (#2803)

### Pull Requests

- [#2803](https://github.com/rollup/rollup/pull/2803): Handle out-of-order binding of identifiers to improve tree-shaking (@lukastaegert)

## 1.9.2

_2019-04-10_

### Bug Fixes

- Allowing replacing `output.file` with `output.dir` in the `outputOptions` hook (#2802)

### Pull Requests

- [#2802](https://github.com/rollup/rollup/pull/2802): Observe modified output options in bundle.write (@lukastaegert)

## 1.9.1

_2019-04-10_

### Bug Fixes

- Make sure inline comments in dynamic imports are preserved (#2797)

### Pull Requests

- [#2797](https://github.com/rollup/rollup/pull/2797): Emit inline comments inside dynamic import (@manucorporat)

## 1.9.0

_2019-04-05_

### Features

- Add built-in support for bigint (#2789)

### Pull Requests

- [#2789](https://github.com/rollup/rollup/pull/2789): Ship with bigint support built-in (@danielgindi)
- [#2791](https://github.com/rollup/rollup/pull/2791): Use shared extractAssignedNames from rollup-pluginutils ( @lukastaegert)
- [#2792](https://github.com/rollup/rollup/pull/2792): Test that rollup-plugin-commonjs works with preserveModules ( @lukastaegert)

## 1.8.0

_2019-04-02_

### Features

- Support `module` as alias for `esm` and `commonjs` for `cjs` to match Node (#2783)

### Pull Requests

- [#2782](https://github.com/rollup/rollup/pull/2782): Inline interopDefault in config loading (@guybedford)
- [#2783](https://github.com/rollup/rollup/pull/2783): Support Node-style format aliases (@guybedford)

## 1.7.4

_2019-03-28_

### Bug Fixes

- Improve TypeScript type of the treeshaking options (#2779)

### Pull Requests

- [#2779](https://github.com/rollup/rollup/pull/2779): Make all properties in TreeshakingOptions optional (@ndelangen)

## 1.7.3

_2019-03-24_

### Bug Fixes

- Use getters when re-exporting live-bindings (#2765)

### Pull Requests

- [#2765](https://github.com/rollup/rollup/pull/2765): Support exporting live-bindings from other chunks or external dependencies (@lukastaegert)

## 1.7.2

_2019-03-24_

### Bug Fixes

- Make sure relative external ids are resolved correctly (#2774)

### Pull Requests

- [#2774](https://github.com/rollup/rollup/pull/2774): Resolve relative external ids (@lukastaegert)

## 1.7.1

_2019-03-24_

### Bug Fixes

- Prevent invalid code when exporting several hundred identifiers from a chunk (#2768)
- Do not wrongly deconflict labels (#2776)

### Pull Requests

- [#2768](https://github.com/rollup/rollup/pull/2768): Sanitize shortened internal export names (@lukastaegert)
- [#2769](https://github.com/rollup/rollup/pull/2769): Update dependencies and fix security issue (@lukastaegert)
- [#2776](https://github.com/rollup/rollup/pull/2776): Do not treat break labels as identifiers (@lukastaegert)

## 1.7.0

_2019-03-20_

### Features

- Sort chunk exports by name for greater consistency (#2757)

### Bug Fixes

- Fix a situation where tree-shakeable code would not be removed in an indeterminate manner (#2757)

### Pull Requests

- [#2757](https://github.com/rollup/rollup/pull/2757): Sort modules before binding, sort exports (@lukastaegert)

## 1.6.1

_2019-03-20_

### Bug Fixes

- Avoid name clashes of unused default exports when tree-shaking is false (#2758)
- Do not crash when generating SystemJS bundles containing array patterns with member expressions (#2760)

### Pull Requests

- [#2758](https://github.com/rollup/rollup/pull/2758): Make sure unused default exports are deconflicted when tree-shaking is false (@lukastaegert)
- [#2760](https://github.com/rollup/rollup/pull/2760): Handle member expressions in array patterns (@lukastaegert)

## 1.6.0

_2019-03-08_

### Features

- Add plugin hook to modify output options (#2736)

### Pull Requests

- [#2736](https://github.com/rollup/rollup/pull/2736): Add hook for modifying OutputOptions (@Comandeer)

## 1.5.0

_2019-03-07_

### Features

- Allow resolving to a different id while marking it as external at the same time (#2734)

### Pull Requests

- [#2734](https://github.com/rollup/rollup/pull/2734): Allow resolveId to return an object (@lukastaegert)

## 1.4.2

_2019-03-07_

### Bug Fixes

- Respect variable identity of exports when hashing (#2741)
- Resolve a situations where a variable was imported twice with the same name (#2737)

### Pull Requests

- [#2741](https://github.com/rollup/rollup/pull/2741): Fix hashing when different variable are exported using the same name (@lukastaegert)
- [#2737](https://github.com/rollup/rollup/pull/2737): Fix duplicate imports with conflicting names (@lukastaegert)

## 1.4.1

_2019-03-04_

### Bug Fixes

- Do not treat the import target "" as external by default (#2733)

### Pull Requests

- [#2733](https://github.com/rollup/rollup/pull/2733): Do not treat the import target "" as external by default ( @LongTengDao)

## 1.4.0

_2019-03-01_

### Features

- Add option to change the name of the dynamic import function to allow polyfilling it (#2723)

### Pull Requests

- [#2723](https://github.com/rollup/rollup/pull/2723): Add dynamicImportFunction option (@keithamus)

## 1.3.3

_2019-03-01_

### Bug Fixes

- Fix performance regression when handling long chains of calls to property methods (#2732)

### Pull Requests

- [#2730](https://github.com/rollup/rollup/pull/2730): Order types, interfaces, classes, and object members ( @lukastaegert)
- [#2732](https://github.com/rollup/rollup/pull/2732): Take chunk export mode into account when reexporting default ( @lukastaegert)

## 1.3.2

_2019-02-27_

### Bug Fixes

- Allow ids of default exported classes to be exported separately (#2728)

### Pull Requests

- [#2728](https://github.com/rollup/rollup/pull/2728): Update dependencies (@lukastaegert)

## 1.3.1

_2019-02-27_

### Bug Fixes

- Correctly reexport the default export from entry chunks (#2727)

### Pull Requests

- [#2727](https://github.com/rollup/rollup/pull/2727): Take chunk export mode into account when reexporting default ( @lukastaegert)

## 1.3.0

_2019-02-26_

### Features

- Treeshake call expressions prefixed with UglifyJS style `@__PURE__` annotations (#2429)

### Pull Requests

- [#2429](https://github.com/rollup/rollup/pull/2429): Add support for /_#**PURE**_/ comments (@conartist6 and @lukastaegert)

## 1.2.5

_2019-02-26_

### Bug Fixes

- Store external ids reported by plugins in watch mode (#2718)

### Pull Requests

- [#2718](https://github.com/rollup/rollup/pull/2718): Incremental external (@andreas-karlsson)

## 1.2.4

_2019-02-26_

### Bug Fixes

- Fix an issue where a variable was imported twice under the same name (#2715)

### Pull Requests

- [#2715](https://github.com/rollup/rollup/pull/2715): Deduplicate imports referencing default exports and their original variables (@lukastaegert)

## 1.2.3

_2019-02-23_

### Bug Fixes

- Use correct path when rendering dynamic imports where the entry module is empty (#2714)

### Pull Requests

- [#2714](https://github.com/rollup/rollup/pull/2714): Properly render dynamic imports when imported module is empty ( @lukastaegert)

## 1.2.2

_2019-02-19_

### Bug Fixes

- Fix wrong external imports when using the `paths` options only for some outputs (#2706)

### Pull Requests

- [#2706](https://github.com/rollup/rollup/pull/2706): Always recreate paths for external modules (@lukastaegert)

## 1.2.1

_2019-02-17_

### Bug Fixes

- Fix ESM version of Rollup (#2705)

### Pull Requests

- [#2705](https://github.com/rollup/rollup/pull/2705): Fix ESM version of Rollup (@lukastaegert)

## 1.2.0

_2019-02-17_

### Features

- Fewer renamed variables due to a completely reimplemented deconflicting logic (#2689)

### Bug Fixes

- Respect rendered and tree-shaken exports when determining chunk hashes (#2695)
- Fix an error when dynamic imports end up in the same chunk as one of their importees (#2677)
- Do not generate invalid code when expressions containing IIFEs are simplified (#2696)
- Do not throw an error when more than ten bundles are watched (#2700)
- Treat re-exported globals in a spec-compliant way (#2691)
- Fix issues related to wrongly renamed variables (#2689)
- Do not throw an error if config files contain non-default exports (#2673)
- Improve type of `RollupOutput.output` to guarantee at least one chunk (#2679)

### Pull Requests

- [#2673](https://github.com/rollup/rollup/pull/2673): Allow config files to have non-default exports (@swansontec)
- [#2677](https://github.com/rollup/rollup/pull/2677): Prevent final resolution and facade creation for inlined dynamic imports (@Rich-Harris and @lukastaegert)
- [#2679](https://github.com/rollup/rollup/pull/2679): Improve type of `RollupOutput.output` (@MattiasBuelens)
- [#2689](https://github.com/rollup/rollup/pull/2689): Reimplement variable deconflicting logic (@lukastaegert)
- [#2691](https://github.com/rollup/rollup/pull/2691): Fix CI issues and update acorn dependency (@lukastaegert)
- [#2693](https://github.com/rollup/rollup/pull/2693): Fix typo in export-globals test (@MattiasBuelens)
- [#2695](https://github.com/rollup/rollup/pull/2695): Respect rendered exports when generating chunk hashes ( @lukastaegert)
- [#2696](https://github.com/rollup/rollup/pull/2696): Correctly render function expression inside simplified expression statements (@lukastaegert)
- [#2700](https://github.com/rollup/rollup/pull/2700): Add a fix for MaxListenersExceededWarning (@luwes)
- [#2703](https://github.com/rollup/rollup/pull/2703): Update rollup-pluginutils (@lukastaegert)

## 1.1.2

_2019-01-21_

### Bug Fixes

- Tree-shaken dynamic imports no longer leave behind `undefined` entries in the bundle information (#2663)
- Dynamic imports in dynamically imported files could lead to crashes and would not always create new chunks (#2664)

### Pull Requests

- [#2663](https://github.com/rollup/rollup/pull/2663): Do not include tree-shaken dynamic imports in bundle information (@lukastaegert)
- [#2664](https://github.com/rollup/rollup/pull/2664): Properly handle dynamic imports declared in dynamically imported files (@everdimension)

## 1.1.1

_2019-01-19_

### Bug Fixes

- Make sure object prototype methods are not considered to be falsy when tree-shaking (#2652)

### Pull Requests

- [#2652](https://github.com/rollup/rollup/pull/2652): Make sure object prototype methods are not considered to be falsy (@lukastaegert)
- [#2654](https://github.com/rollup/rollup/pull/2654): Use correct signature for `this.setAssetSource` in docs ( @everdimension)
- [#2656](https://github.com/rollup/rollup/pull/2656): Swap descriptions for `[extname]` and `[ext]` in docs (@tivac)

## 1.1.0

_2019-01-09_

### Features

- Make `this.meta` available from the `options` plugin hook (#2642)
- Add a new `writeBundle` plugin hook that is called _after_ all files have been written (#2643)

### Bug Fixes

- Make sure the `acorn` import of the bundled non-ESM acorn plugins is correctly translated to ESM (#2636)
- Make sure input options are actually passed to the `buildStart` hook (#2642)

### Pull Requests

- [#2636](https://github.com/rollup/rollup/pull/2636): Improve how acorn is imported, update dependencies ( @lukastaegert)
- [#2642](https://github.com/rollup/rollup/pull/2642): Make this.meta available in options hook, pass input options to buildStart (@lukastaegert)
- [#2643](https://github.com/rollup/rollup/pull/2643): Implement writeBundle hook (@lukastaegert)

## 1.0.2

_2019-01-05_

### Bug Fixes

- Make sure the transform hook is always reevaluated when a file watched by the hook changes (#2633)
- Fix a crash when generating hashes for tree-shaken dynamic imports (#2638)
- Fix a crash and some inconsistencies when using the acorn-bigint plugin (#2640)

### Pull Requests

- [#2633](https://github.com/rollup/rollup/pull/2633): Document `this.addWatchFile` and make sure it also declares transform dependencies (@lukastaegert)
- [#2635](https://github.com/rollup/rollup/pull/2635): Make sure `code` is optional in warning type (@lukastaegert)
- [#2638](https://github.com/rollup/rollup/pull/2638): Do not fail when generating hashes for tree-shaken dynamic imports (@lukastaegert)
- [#2640](https://github.com/rollup/rollup/pull/2640): Always treat bigints as unknown (@lukastaegert)
- [#2641](https://github.com/rollup/rollup/pull/2641): Make sure all CLI options are listed in the summary ( @lukastaegert)

## 1.0.1

_2019-01-03_

### Bug Fixes

- Properly handle reexporting an external default export for non-ESM targets when using named exports mode (#2620)
- Do not (wrongly) re-declare input options in the merged `RollupOptions` type (#2622)

### Pull Requests

- [#2620](https://github.com/rollup/rollup/pull/2620): Fixed issue with reexporting default as default with `{exports: named, interop: true}` options (@Andarist)
- [#2622](https://github.com/rollup/rollup/pull/2622): Simplify RollupOptions (@Kinrany)
- [#2627](https://github.com/rollup/rollup/pull/2627): Show how to skip imports for optional plugins (@chris-morgan)

## 1.0.0

_2018-12-28_

### Breaking Changes

- Several (mostly deprecated) options have been removed or renamed (#2293, #2409):
  - banner -> output.banner
  - dest -> output.file
  - entry -> input
  - experimentalCodeSplitting -> now always active
  - experimentalDynamicImport -> now always active
  - experimentalPreserveModules -> preserveModules
  - exports -> output.exports
  - extend -> output.extend
  - footer -> output.footer
  - format -> output.format
  - freeze -> output.freeze
  - globals -> output.globals
  - indent -> output.indent
  - interop -> output.interop
  - intro -> output.intro
  - load -> use plugin API
  - moduleName -> output.name
  - name -> output.name
  - noConflict -> output.noConflict
  - output.moduleId -> output.amd.id
  - outro -> output.outro
  - paths -> output.paths
  - preferConst -> output.preferConst
  - pureExternalModules -> treeshake.pureExternalModules
  - resolveExternal -> use plugin API
  - resolveId -> use plugin API
  - sourcemap -> output.sourcemap
  - sourceMap -> output.sourcemap
  - sourceMapFile -> output.sourcemapFile
  - strict -> output.strict
  - targets -> use output as an array
  - transform -> use plugin API
  - useStrict -> output.strict
- In general, output options can no longer be used as input options (#2409)
- `bundle.generate` and `bundle.write` now return a new format (#2293)
- Several plugin hooks have become deprecated and will display warnings when used (#2409):
  - transformBundle
  - transformChunk
  - ongenerate
  - onwrite
- Plugin transform dependencies are deprecated in favour of using the `this.addWatchFile` plugin context function ( #2409)
- Accessing `this.watcher` in plugin hooks is deprecated in favour of the `watchChange` plugin hook and the `this.addWatchFile` plugin context function (#2409)
- Using dynamic import statements will by default create a new chunk unless `inlineDynamicImports` is used (#2293)
- Rollup now uses acorn@6 which means that acorn plugins must be compatible with this version; acorn is now external for non-browser builds to make plugins work (#2293)

### Features

- The `--dir` ClI option can now be aliased as `-d` (#2293)
- The `--input` option now supports named entry points via `=` (#2293)

### Bug Fixes

- Both the `--input` option as well as the default CLI option now support named inputs (#2293)

### Pull Requests

- [#2293](https://github.com/rollup/rollup/pull/2293): Unify code paths for 1.0 relase and update documentation ( @guybedford and @lukastaegert)
- [#2409](https://github.com/rollup/rollup/pull/2409): Remove old deprecated features and add new deprecation warnings ( @guybedford)
- [#2486](https://github.com/rollup/rollup/pull/2486): Upgrade to acorn 6 (@marijnh)
- [#2611](https://github.com/rollup/rollup/pull/2611): Fix hook's name in test description (@Andarist)
- [#2612](https://github.com/rollup/rollup/pull/2612): Fix a self-contradicting comment in the docs (@LongTengDao)

For previous changelogs, see

- [Rollup 0.x](./CHANGELOG-0.md)
