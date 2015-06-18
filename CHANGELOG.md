# rollup changelog

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
