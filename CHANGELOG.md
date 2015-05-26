# rollup changelog

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
