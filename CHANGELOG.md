# rollup changelog

## 5.0.0

_2026-07-31_

### BREAKING CHANGES

#### General Changes

- The minimal required Node version is now 22.12.0 (#6532)

#### Manual Chunk Changes

- Manual chunks no longer absorb the full transitive dependency subtree of their modules; depending on `output.onlyExplicitManualChunks`, they either behave like entry points that also contain all modules always loaded together with them, or contain exactly their assigned modules (#6533)
- Manual chunks none of whose modules are included in the bundle, e.g. because only a pure re-export barrel file was listed that all imports bypass, are no longer generated; Rollup now emits an `EMPTY_MANUAL_CHUNK` warning instead (#6533)

#### Module Changes

- Import attributes are now part of the module identity: importing the same module with different import attributes now creates separate module instances instead of triggering the `INCONSISTENT_IMPORT_ATTRIBUTES` warning, which has been removed (#6266)
- The `id` of a module with import attributes now encodes the attributes as a URL search parameter, e.g. `/src/data.json?attributes=%7B%22type%22%3A%22json%22%7D`; the id without the encoded attributes is available as the new `rawId` property of `ModuleInfo`; plugins that match on the id of a module need to account for the encoded attributes, e.g. by matching on `rawId` in the handler or by allowing a query suffix in the `id` filter of `load`/`transform` hooks, e.g. `/\.json($|\?)/` (#6266)
- The `attributes` property has been moved from `ModuleOptions` to `ModuleInfo` (#6266)
- The options of the `load` and `transform` hooks no longer contain the Vite-specific `ssr` property, which was never filled by Rollup (#6266)
- The `attributes` option of the `resolveImportMeta` and `resolveFileUrl` hooks has been renamed to `moduleAttributes` (#6266)
- The `importerAttributes` option of `this.resolve` has been deprecated in favor of the new `{ rawId, attributes }` importer form (#6266)
- Returning `attributes` from the `load` or `transform` hooks has been deprecated and now emits a warning (#6266)

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
- `output.onlyExplicitManualChunks` now also applies to the object form of `output.manualChunks`, is no longer deprecated, and defaults to `false` for the object form and to `true` for the function form, so the function form no longer adds the dependencies of returned modules to the manual chunk by default (#6533)

### Features

- Rollup no longer installs the native `fsevents` module as an optional dependency on macOS (#5778)
- TypeScript types for all ASTs exposed by Rollup are now generated from Rollup's own AST definitions and exported via the `ast` namespace; being discriminated unions, they allow type narrowing via `node.type` and always match the syntax Rollup supports; they try to follow the [ESTree specification](https://github.com/estree/estree) if possible (#5730)
- The ASTs exposed via `moduleInfo.ast` and the `shouldTransformCachedModule` hook are now generated lazily from binary buffers, which significantly reduces processing time and memory when only some AST nodes are needed (#6257)
- The new helpers `parseLazyAst`, `parseLazyAstAsync`, `deserializeAst`, `deserializeLazyAst` and `serializeAst` are exported from `rollup/parseAst` for working with binary AST buffers (#6257)
- The new `this.parseAndWalk` plugin hook and the `parseAndWalk` helper exported from `rollup/parseAst` provide an efficient way to walk the AST of a piece of code: the AST is traversed on the Rust side and only the visited nodes are materialized, and visitor handlers can use `parseChildren` and `skipChildren` to control which children are traversed (#6271)
- When `collectScopes: true` is passed to `this.parseAndWalk` or `parseAndWalk`, the scopes of the visited nodes are collected so that visitor handlers can check via `api.scope.contains(name)` whether an identifier is contained in the current scope, which replaces the need for `attachScopes` from `@rollup/pluginutils` (#6271)
- The same module can now be imported with different import attributes to create separate module instances, e.g. to import a JSON file both as JSON and as raw text (#6266)
- The `load`, `transform` and `shouldTransformCachedModule` hooks now receive the `rawId` of the module in their options while the `resolveId` and `resolveDynamicImport` hooks now receive the `importerRawId` of the importing module (#6266)
- The `resolveImportMeta` and `resolveFileUrl` hooks now receive the `moduleRawId` of the module in their options, and the `renderDynamicImport` hook now receives `moduleRawId`, `moduleAttributes` and `targetModuleRawId` (#6266)
- The function form of the `external` option now receives the `attributes`, `importerAttributes` and `importerRawId` in a fourth argument while the function forms of `output.globals` and `output.paths` now receive the import `attributes` in an additional argument (#6266)
- The object and function forms of `output.globals` and `output.paths` continue to use the id without import attributes (`rawId`) of external modules, so existing entries also match modules with import attributes (#6266)
- Rollup now emits an `AMBIGUOUS_GLOBAL_NAME` warning when the object form of `output.globals` maps several import attribute variants of the same external module to a single global name as only the function form can distinguish them (#6266)
- `this.resolve`, `this.load`, `this.getModuleInfo` and the `importer` and `implicitlyLoadedAfterOneOf` options of `this.emitFile` now also accept `{ rawId, attributes }` objects besides module ids, and `EmittedChunk` gained an `attributes` option (#6266)
- `RenderedModule` gained `rawId` and `attributes` while `PreRenderedChunk` gained `facadeModuleRawId` and `facadeModuleAttributes` (#6266)
- Manual chunks that are only loaded via dynamic imports now behave like dynamic entries, so modules that are already loaded when the manual chunk is imported stay in the importing chunk (#6533)
- The `CIRCULAR_CHUNK` warning now only gives manual chunk advice when a manual chunk is part of the cycle, and that advice depends on `onlyExplicitManualChunks` (#6533)

### Bug Fixes

- Rollup no longer panics when parsing JSX that contains namespaced element names like `<a:b />` (#6271)
- When `experimentalMinChunkSize` is used together with `onlyExplicitManualChunks: true`, loading an entry no longer runs side effects of unrelated manual chunk modules (#6533)
- When the same dynamic import is reached from several entries, the dynamically imported chunk no longer imports from an unrelated entry chunk and thereby runs that entry's side effects (#6533)
- Chunks emitted with `implicitlyLoadedAfterOneOf` are no longer missing from the output when their module is fully tree-shaken, e.g. when using `preserveModules`, which made `this.getFileName` throw for their reference id (#6533)

### Pull Requests

- [#5778](https://github.com/rollup/rollup/pull/5778): [v5.0] Update to chokidar v4 (@re-taro)
- [#5730](https://github.com/rollup/rollup/pull/5730): [v5.0] Make Rollup generate its own AST types (@lukastaegert)
- [#6248](https://github.com/rollup/rollup/pull/6248): [v5.0] Use "with" as the keyword of import attributes by default (@TrickyPi)
- [#6257](https://github.com/rollup/rollup/pull/6257): [v5.0] Put binary AST buffers into cache (@lukastaegert)
- [#6271](https://github.com/rollup/rollup/pull/6271): [v5.0] Implement efficient AST walking API (@lukastaegert)
- [#6266](https://github.com/rollup/rollup/pull/6266): [v5.0] Support importing the same module with different import attributes (@TrickyPi)
- [#6531](https://github.com/rollup/rollup/pull/6531): [v5.0] Update chokidar to v5 (@lukastaegert)
- [#6532](https://github.com/rollup/rollup/pull/6532): [v5.0] Require Node.js 22.12.0 (@lukastaegert)
- [#6533](https://github.com/rollup/rollup/pull/6533): [v5.0] Rework manual chunks for Rollup 5 (@lukastaegert)

For previous changelogs, see

- [Rollup 4.x](./CHANGELOG-4.md)
- [Rollup 3.x](./CHANGELOG-3.md)
- [Rollup 2.x](./CHANGELOG-2.md)
- [Rollup 1.x](./CHANGELOG-1.md)
- [Rollup 0.x](./CHANGELOG-0.md)
