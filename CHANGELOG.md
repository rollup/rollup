# rollup changelog

## 5.0.0

_2026-06-28_

### BREAKING CHANGES

#### AST Changes

- The ASTs exposed by Rollup, e.g. in `this.parse()`, `moduleInfo.ast` or the `specifier` argument of `resolveDynamicImport`, are now typed with Rollup's own AST types instead of `estree` types (#5730)
- The `AstNode` type has been removed; use the types of the `ast` namespace, e.g. `ast.AstNode`, instead (#5730)
- JSX nodes are now strongly typed instead of `any` (#5730)
- The `ResolveIdResultWithoutNullValue` type has been removed (#5730)
- The annotation properties of AST nodes have been renamed from `_rollupAnnotations` to `annotations` and from `_rollupRemoved` to `invalidAnnotations` (#5730)
- The `cooked` property of a `TemplateElement` value is now `undefined` instead of `null` when there is no cooked value (#5730)
- The `phase` property of import declarations and dynamic imports is now always present with the value `undefined` when there is no import phase instead of being omitted (#5730)
- `moduleInfo.ast` now returns a new lazy AST on each access whose nested properties are only materialized when they are accessed; mutating the AST is no longer supported as changes are not persisted and may throw (#6257)
- The `ast` passed to the `shouldTransformCachedModule` hook is now a lazy AST as well (#6257)
- ASTs returned from the `load` or `transform` hooks are now serialized into a binary buffer before Rollup uses them; this carries a performance penalty, should be avoided and might be deprecated in the future; it also discards extra properties of AST nodes and throws a `CANNOT_SERIALIZE_AST` error for node types that are not known to Rollup instead of supporting custom AST nodes (#6257)
- The TypeScript types of the Node build now reference Node's `Buffer` type in the AST buffer helpers, which requires `@types/node` to be installed; the types of the browser build use `Uint8Array` instead (#6257)
- The `signal` option of `parseAstAsync` has been removed as it could not abort an ongoing parsing but at best prevent a not-yet-started parsing, which made its effect unpredictable (#6271)

#### Cache Changes

- The Rollup cache now stores the AST of each module as a binary buffer in the `astBuffer` property instead of a JSON representation in the `ast` property; caches created by Rollup 4 can no longer be read (#6257)
- `bundle.cache` is no longer purely JSON serializable as it contains typed arrays; storing it externally requires a serializer that supports typed arrays, e.g. `v8.serialize` (#6257)
- The `ModuleJSON` type has been replaced by the `CachedModule` type and the `TransformModuleJSON` type has been replaced by the `ModuleSource` type (#6257)

#### Watch Mode Changes

- Watch mode no longer supports glob patterns as chokidar v4 removed glob support: glob patterns passed to `watch.chokidar` options such as `ignored` are now treated as literal paths (#5778)
- The `useFsEvents` option has been removed as chokidar v4 does not support the native macOS `fsevents` API anymore; use `usePolling` instead if you run into issues with too many open files (#5778)
- The `disableGlobbing` option has been removed together with the glob support it disabled (#5778)
- The `ChokidarOptions` type now matches the options supported by chokidar v4, which means the `ignored` option is properly typed as a list of paths, regular expressions, match functions or `{ path, recursive }` objects instead of `any` (#5778)

#### Config Changes

- The `output.importAttributesKey` option now defaults to `"with"` instead of `"assert"`: the import attributes of external imports, re-exports and dynamic imports are rendered with the `with` keyword in the generated output regardless of the keyword used in the source; set `output.importAttributesKey: "assert"` to restore the old behavior (#6248)
- When Rollup transpiles or bundles the config file itself, e.g. when using `--configPlugin` or `--bundleConfigAsCjs`, the generated config uses the `with` keyword as well; use `--configImportAttributesKey assert` to restore the old behavior (#6248)

### Features

- Rollup no longer installs the native `fsevents` module as an optional dependency on macOS (#5778)
- TypeScript types for all ASTs exposed by Rollup are now generated from Rollup's own AST definitions and exported via the `ast` namespace; being discriminated unions, they allow type narrowing via `node.type` and always match the syntax Rollup supports; they try to follow the [ESTree specification](https://github.com/estree/estree) if possible (#5730)
- The ASTs exposed via `moduleInfo.ast` and the `shouldTransformCachedModule` hook are now generated lazily from binary buffers, which significantly reduces processing time and memory when only some AST nodes are needed (#6257)
- The new helpers `parseLazyAst`, `parseLazyAstAsync`, `deserializeAst`, `deserializeLazyAst` and `serializeAst` are exported from `rollup/parseAst` for working with binary AST buffers (#6257)
- The new `this.parseAndWalk` plugin hook and the `parseAndWalk` helper exported from `rollup/parseAst` provide an efficient way to walk the AST of a piece of code: the AST is traversed on the Rust side and only the visited nodes are materialized, and visitor handlers can use `parseChildren` and `skipChildren` to control which children are traversed (#6271)
- When `collectScopes: true` is passed to `this.parseAndWalk` or `parseAndWalk`, the scopes of the visited nodes are collected so that visitor handlers can check via `api.scope.contains(name)` whether an identifier is contained in the current scope, which replaces the need for `attachScopes` from `@rollup/pluginutils` (#6271)

### Bug Fixes

- Rollup no longer panics when parsing JSX that contains namespaced element names like `<a:b />` (#6271)

### Pull Requests

- [#5778](https://github.com/rollup/rollup/pull/5778): [v5.0] Update to chokidar v4 (@re-taro)
- [#5730](https://github.com/rollup/rollup/pull/5730): [v5.0] Make Rollup generate its own AST types (@lukastaegert)
- [#6248](https://github.com/rollup/rollup/pull/6248): [v5.0] Use "with" as the keyword of import attributes by default (@TrickyPi)
- [#6257](https://github.com/rollup/rollup/pull/6257): [v5.0] Put binary AST buffers into cache (@lukastaegert)
- [#6271](https://github.com/rollup/rollup/pull/6271): [v5.0] Implement efficient AST walking API (@lukastaegert)

For previous changelogs, see

- [Rollup 4.x](./CHANGELOG-4.md)
- [Rollup 3.x](./CHANGELOG-3.md)
- [Rollup 2.x](./CHANGELOG-2.md)
- [Rollup 1.x](./CHANGELOG-1.md)
- [Rollup 0.x](./CHANGELOG-0.md)
