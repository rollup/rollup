# rollup changelog

## 0.19.2

* Fix exporting namespaces to include all of their exports ([#204](https://github.com/rollup/rollup/issues/204))
* Namespace exotic objects are frozen to ensure that its properties cannot be modified, reconfigured, redefined or deleted ([#203](https://github.com/rollup/rollup/pulls/203))
* Fix `ReferenceError: Promise is not defined` in node v0.10 ([#189](https://github.com/rollup/rollup/issues/189))

## 0.19.1

* Fix `module.basename()` when used with custom `resolveId` function
* Use [rollup-babel](https://github.com/rollup/rollup-babel) to build self
* Exposed the version string through the API: `require( 'rollup' ).VERSION`

## 0.19.0

* **breaking** The `transform` option is no longer passed through to custom loaders. Loaders should only concern themselves with providing source code; transformation will *always* take place
* `options.transform` functions can return a string, or a `{code, map, ast}` object. Where possible, sourcemap chains will be flattened ([#175](https://github.com/rollup/rollup/pull/175))
* `options.resolveId`, `options.resolveExternal` and `options.load` can each be a function or an array of functions. If an array, the first non-null/undefined return value is used. In both cases, failed resolution/loading will fall back to the defaults, unless an error is thrown. ([#174](https://github.com/rollup/rollup/pull/174))
* New `intro` and `outro` options – similar to `banner` and `footer` except inserted *inside* any format-specific wrapper
* Multiple var declarations in an export block (e.g. `export let a = 1, b = 2`) are split up to facilitate tree-shaking ([#171](https://github.com/rollup/rollup/issues/171))
* More informative error when using a missing namespace property  ([#169](https://github.com/rollup/rollup/pull/169))
* Update various dependencies

## 0.18.5

* Allow namespaces to be assigned to variables ([#168](https://github.com/rollup/rollup/issues/168))
* Promote `chalk` and `source-map-support` to `dependencies`, as they're used by the CLI ([#167](https://github.com/rollup/rollup/pull/167))

## 0.18.4

* Make external modules configurable (i.e. `external.config.foo = 'bar'`) without erroring

## 0.18.3

* Crop indent exclusion ranges to exclude enclosing quotes ([#166](https://github.com/rollup/rollup/issues/166))

## 0.18.2

* Include definitions of namespace members that are exported as defaults

## 0.18.1

* Include `acorn.parse` in bundle, remove `sander` from dependencies, simplify build

## 0.18.0

* Internal rewrite
* Reinstate statically-analysable namespace imports
* Avoid using getters in namespace blocks where possible ([#144](https://github.com/rollup/rollup/issues/144))
* Track variable aliases ([#96](https://github.com/rollup/rollup/issues/96))
* Prevent multiline strings being indented ([#164](https://github.com/rollup/rollup/issues/164))

## 0.17.4

* Allow imports from hidden directories (replay of [#133](https://github.com/rollup/rollup/issues/133))

## 0.17.3

* Handle parenthesised default exports ([#136](https://github.com/rollup/rollup/issues/136))

## 0.17.2

* Allow use of scoped npm packages ([#131](https://github.com/rollup/rollup/issues/131))

## 0.17.1

* Allow namespaces to be passed to a function ([#149](https://github.com/rollup/rollup/issues/149))

## 0.17.0

* Roll back to 0.15.0 and reapply subsequent fixes pending resolution of ([#132](https://github.com/rollup/rollup/issues/132)) and related issues

## 0.16.4

* Fix import paths with `.` ([#133](https://github.com/rollup/rollup/issues/133))
* Prevent sourceMappingURL confusion leading to broken sourcemap
* Add code coverage reporting [#130](https://github.com/rollup/rollup/pull/130))
* Add `modules` property to user-facing `bundle` – an array with `{id}` objects ([#128](https://github.com/rollup/rollup/issues/128))

## 0.16.3

* Prevent adjacent blocks of multiple var declarations causing magic-string failure ([#105](https://github.com/rollup/rollup/issues/105))

## 0.16.2

* Top-level function calls and assignments to globals are treated as side-effects, and always included
* Import files from subdirectories of external packages, e.g. `import mod from 'foo/sub/mod'` ([#126](https://github.com/rollup/rollup/issues/126))

## 0.16.1

* Handle assignment patterns, and destructured/rest parameters, when analysing scopes
* Fix bug preventing project from self-building (make base `Identifier` class markable)

## 0.16.0

* Internal refactoring ([#99](https://github.com/rollup/rollup/pull/99))
* Optimisation for statically-analysable namespace imports ([#99](https://github.com/rollup/rollup/pull/99))
* Windows support (theoretically!) ([#117](https://github.com/rollup/rollup/pull/117) / [#119](https://github.com/rollup/rollup/pull/119))

## 0.15.0

* Load all modules specified by `import` statements, and do tree-shaking synchronously once loading is complete. This results in simpler and faster code, and enables future improvements ([#97](https://github.com/rollup/rollup/pull/97))
* Only rewrite `foo` as `exports.foo` when it makes sense to ([#92](https://github.com/rollup/rollup/issues/92))
* Fix bug with shadowed variables that are eventually exported ([#91](https://github.com/rollup/rollup/issues/91))
* Exclude unused function declarations that happen to modify a used name ([#90](https://github.com/rollup/rollup/pull/90))
* Simplify internal `Scope` model – scopes always attach to blocks, never function expressions/declarations

## 0.14.1

* `export { name } from './other'` does not create a local binding ([#16](https://github.com/rollup/rollup/issues/16))
* A single binding can be exported under multiple names ([#18](https://github.com/rollup/rollup/issues/18))
* `useStrict` option exposed to CLI as `--strict`/`--no-strict` ([#81](https://github.com/rollup/rollup/issues/81))
* Neater exports from ES6 bundles

## 0.14.0

* Internal refactoring
* Correctly deconflict generated default export names ([#72](https://github.com/rollup/rollup/issues/72))
* Handle `export { x } from 'y'` declarations ([#74](https://github.com/rollup/rollup/issues/74))
* Dedupe named imports from external modules in ES6 bundles ([#77](https://github.com/rollup/rollup/issues/77))

## 0.13.0

* Support `banner` and `footer` options ([#66](https://github.com/rollup/rollup/pull/66))
* Remove pre-existing sourcemap comments ([#66](https://github.com/rollup/rollup/pull/66))
* Deconflict external imports ([#66](https://github.com/rollup/rollup/pull/66))
* Use existing AST, if provided ([#66](https://github.com/rollup/rollup/pull/66))
* Rename internal namespace exports as appropriate ([#66](https://github.com/rollup/rollup/pull/66))
* Remove uninitialised var declarations that get exported ([#66](https://github.com/rollup/rollup/pull/66))
* Rename variables named `exports` to avoid conflicts ([#66](https://github.com/rollup/rollup/pull/66))

## 0.12.1

* Don't attempt to mark statements belonging to external modules ([#68](https://github.com/rollup/rollup/issues/68))
* Correctly deshadow variables that conflict with imports ([#68](https://github.com/rollup/rollup/issues/68))

## 0.12.0

* Internal re-architecting, resulting in more efficient bundling with reduced memory usage
* Shorthand properties are expanded if necessary ([#61](https://github.com/rollup/rollup/issues/61))
* Fixed various bugs with bundle external dependencies, particularly when generating ES6 bundles ([#59](https://github.com/rollup/rollup/issues/59))
* Add `--globals` option to CLI ([#60](https://github.com/rollup/rollup/pull/60))
* Allow imports of external modules for side-effects ([#55](https://github.com/rollup/rollup/pull/55))
* Prevent Rollup hanging on non-existent external module ([#54](https://github.com/rollup/rollup/pull/54))

## 0.11.4

* Side-effect preservation applies to internal default exports ([#43](https://github.com/rollup/rollup/issues/43))

## 0.11.3

* Class methods are not incorrectly renamed ([#42](https://github.com/rollup/rollup/issues/42))
* External modules are assigned names before canonical names are determined ([#42](https://github.com/rollup/rollup/issues/42))

## 0.11.2

* Correctly handle computed properties (e.g. `foo[bar]`) when discovering dependencies ([#47](https://github.com/rollup/rollup/pull/47))

## 0.11.1

* Support for `export * from '..'` ([#46](https://github.com/rollup/rollup/pull/46))

## 0.11.0

* Experimental browser-friendly build (`dist/rollup.browser.js`) ([#25](https://github.com/rollup/rollup/issues/25))
* Internal re-architecting to make discovery process simpler and more performant
* Preservation of side-effects that happen in a separate module to the affected definition ([#39](https://github.com/rollup/rollup/issues/39))

## 0.10.0

* Better sorting algorithm – sorting happens at the module level, rather than the statement level. This avoids certain edge cases
* IIFEs are ignored for the purposes of distinguishing between 'strong' and 'weak' dependencies
* Empty `var` declarations for exported bindings are omitted

## 0.9.1

* Much faster statement insertion (fixes major 0.9.0 performance regression)

## 0.9.0

* BREAKING - `resolvePath` is now `resolveId`. The returned `id` (which by default is a filepath) is passed to the `load` function, which can optionally be overridden, and which is applied to all modules including the entry module. This allows custom resolver and loading logic for integration with third party systems (e.g. JSPM) or, eventually, in-browser usage ([#30](https://github.com/rollup/rollup/issues/30))
* A statement cannot appear after later statements from the same bundle ([#34](https://github.com/rollup/rollup/issues/34))
* Tricky cyclical dependencies are handled ([#36](https://github.com/rollup/rollup/issues/36))
* `sourcemap` option is used by CLI (was omitted previously)

## 0.8.3

* Correctly rename functions that have arguments with the same name ([#32](https://github.com/rollup/rollup/issues/32))
* Ensure unused default exports are given a legal name ([#33](https://github.com/rollup/rollup/issues/33))

## 0.8.2

* Support `moduleId` and `moduleName` via CLI ([#24](https://github.com/rollup/rollup/issues/24))

## 0.8.1

* Anonymous functions that are exported as default are converted to named function declarations for correct hoisting, rather than being bound to functions ([#29](https://github.com/rollup/rollup/issues/29))
* Automatically-generated default export names are deconflicted with local definitions ([#29](https://github.com/rollup/rollup/issues/29))

## 0.8.0

* Top-level variable declarations with multiple declarators are split up, to avoid unnecessary code importing and incorrectly-ordered statements ([#26](https://github.com/rollup/rollup/issues/26))
* `this` at the top level is `undefined` ([#28](https://github.com/rollup/rollup/issues/28))

## 0.7.8

* Avoid using `path.parse` - unsupported in node 0.10

## 0.7.7

* Promise `source-map-support` from `devDependencies` to `dependencies` ([#23](https://github.com/rollup/rollup/issues/23))

## 0.7.6

* Better placement of `export default` statements ([#21](https://github.com/rollup/rollup/issues/21))
* Prevent function calls and property assignments from being treated as rebinding for sake of unbound default exports
* Add `--external foo,bar,baz` option to CLI (equivalent to `external: ['foo', 'bar', 'baz']`)
* Add CLI tests

## 0.7.5

* Prevent accidental conflicts with the global namespace ([#20](https://github.com/rollup/rollup/issues/20))

## 0.7.4

* More precise statement re-ordering to satisfy `export default` constraint (fixes bug introduced in 0.7.3)

## 0.7.3

* Default exports are not bound. To enable this, statements within a module are sorted to retain their original order ([#15](https://github.com/rollup/rollup/issues/15))
* Better positioning of comments ([#14](https://github.com/rollup/rollup/issues/14))
* Various fixes to get Travis-CI rigged up

## 0.7.2

* Fix sourcemap paths on Windows ([#6](https://github.com/rollup/rollup/pull/6))

## 0.7.1

* Named functions can be used as default exports from a bundle
* Method calls are assumed to mutate the owner (i.e. `foo.bar()` mutates `foo`) ([#13](https://github.com/rollup/rollup/issues/13))
* `options.indent` can be used to control indentation of resulting bundle. `options.true` (default) means 'auto', `options.false` means empty string. Alternatively specify whitespace e.g. `'  '` or `'\t'` ([#5](https://github.com/rollup/rollup/issues/5))

## 0.7.0

* Ensure statements are always separated by a newline ([#9](https://github.com/rollup/rollup/pull/9))
* Use CommonJS `exports` correctly (UMD exports)
* Throw error if `moduleName` is required but missing (UMD exports)
* Attach IIFE global to `this` rather than `window`
* Allow names inside bundle to the the names of `Object.prototype` properties ([#12](https://github.com/rollup/rollup/pull/12))
* Keep exports live ([#11](https://github.com/rollup/rollup/pull/11))

## 0.6.5

* Add sourceMappingURL comment to code, as appropriate
* Higher resolution sourcemaps

## 0.6.4

* Fix CJS bundling with default export

## 0.6.3

* Fix exports and external module imports with some output formats
* Fix endless cycle bug on Windows ([#3](https://github.com/rollup/rollup/pull/3)) - thanks @Bobris

## 0.6.2

* Permit assignments to properties of imported bindings

## 0.6.1

* Support for basic transformers

## 0.6.0

* BREAKING - `rollup.rollup` and `bundle.write` both take a single options argument
* BREAKING - external modules must be declared upfront with `options.external: [...]`
* Non-relative module paths will be resolved by looking for `jsnext:main` fields in the appropriate `package.json` files. This behaviour can be overridden by passing an alternative `resolveExternal` function
* Fix sourcemap options
* Include CLI files in npm package (duh)

## 0.5.0

* Command line interface
* Sourcemap generation
* Correct behaviour with `export { x as y } from 'z'`

## 0.4.1

* More import name deconflicting

## 0.4.0

* Self-hosting! `rollup.rollup` now rolls up rollup
* Fix bug with comments inside a statement later being appended to it
* Prevent shadowing of external modules
* Rewrite computed property identifiers where necessary
* Preserve original statement order where possible
* Internal refactoring

## 0.3.1

* Saner deconflicting
* Rename namespace imports from external modules correctly

## 0.3.0

* Basic functionality present, mostly spec-compliant

## 0.2.1

* Include dist files in npm package (duh)

## 0.2.0

* First release capable of doing anything useful
* Still lots of basic functionality missing

## 0.1.0

* Initial experiment
