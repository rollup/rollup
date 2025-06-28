# rollup changelog

## 5.0.0

_2025-06-28_

### BREAKING CHANGES

#### Watch Mode Changes

- Watch mode no longer supports glob patterns as chokidar v4 removed glob support: glob patterns passed to `watch.chokidar` options such as `ignored` are now treated as literal paths (#5778)
- The `useFsEvents` option has been removed as chokidar v4 does not support the native macOS `fsevents` API anymore; use `usePolling` instead if you run into issues with too many open files (#5778)
- The `disableGlobbing` option has been removed together with the glob support it disabled (#5778)
- The `ChokidarOptions` type now matches the options supported by chokidar v4, which means the `ignored` option is properly typed as a list of paths, regular expressions, match functions or `{ path, recursive }` objects instead of `any` (#5778)

#### AST Type Changes

- The ASTs exposed by Rollup, e.g. in `this.parse()`, `ModuleInfo.ast` or the `specifier` argument of `resolveDynamicImport`, are now typed with Rollup's own AST types instead of `estree` types (#5730)
- The `AstNode` type has been removed; use the types of the `ast` namespace, e.g. `ast.AstNode`, instead (#5730)
- JSX nodes are now strongly typed instead of `any` (#5730)
- The `ResolveIdResultWithoutNullValue` type has been removed (#5730)

#### AST Node Changes

- The annotation properties of AST nodes have been renamed from `_rollupAnnotations` to `annotations` and from `_rollupRemoved` to `invalidAnnotations` (#5730)
- The `cooked` property of a `TemplateElement` value is now `undefined` instead of `null` when there is no cooked value (#5730)
- The `phase` property of import declarations and dynamic imports is now always present with the value `undefined` when there is no import phase instead of being omitted (#5730)

### Features

- Rollup no longer installs the native `fsevents` module as an optional dependency on macOS (#5778)
- TypeScript types for all ASTs exposed by Rollup are now generated from Rollup's own AST definitions and exported via the `ast` namespace; being discriminated unions, they allow type narrowing via `node.type` and always match the syntax Rollup supports; they try to follow the [ESTree specification](https://github.com/estree/estree) if possible (#5730)

### Pull Requests

- [#5778](https://github.com/rollup/rollup/pull/5778): [v5.0] Update to chokidar v4 (@re-taro)
- [#5730](https://github.com/rollup/rollup/pull/5730): [v5.0] Make Rollup generate its own AST types (@lukastaegert)

For previous changelogs, see

- [Rollup 4.x](./CHANGELOG-4.md)
- [Rollup 3.x](./CHANGELOG-3.md)
- [Rollup 2.x](./CHANGELOG-2.md)
- [Rollup 1.x](./CHANGELOG-1.md)
- [Rollup 0.x](./CHANGELOG-0.md)
