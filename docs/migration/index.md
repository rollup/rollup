---
title: Migrating to Rollup 5
---

# {{ $frontmatter.title }}

[[toc]]

This guide lists all breaking changes and deprecations in Rollup 5 and explains what to do instead.

For a full list of all changes including features and bug fixes, see the

- [Rollup 5 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#500)

For how to migrate from earlier versions, [see below](#migrating-to-rollup-4).

## Before you upgrade

Rollup 5 requires Node 22.22.0 or later. Update all your Rollup plugins to their latest versions before upgrading, as most plugin-related changes are handled there.

If you use TypeScript, install `@types/node`: the types of the Node build now reference Node's `Buffer` type. If you cannot add it, enable `skipLibCheck` in your `tsconfig.json` instead.

## Changes Affecting Your Build Setup

### Rework manual chunk configuration

Manual chunks no longer contain the full transitive dependency subtree. Whether a manual chunk contains only its assigned modules or also the modules that are always loaded with them depends on [`output.onlyExplicitManualChunks`](../configuration-options/index.md#output-onlyexplicitmanualchunks):

- With the object form of [`output.manualChunks`](../configuration-options/index.md#output-manualchunks), `output.onlyExplicitManualChunks` defaults to `false`: the chunk behaves like an entry point and contains the listed modules together with the modules that are always loaded with them. Modules shared with other entries or manual chunks are extracted into separate chunks.
- With the function form, `output.onlyExplicitManualChunks` defaults to `true`: the chunk contains exactly the modules you return, and their dependencies are chunked normally. If you relied on dependencies being merged into the chunk, either set `output.onlyExplicitManualChunks: false` or return the same chunk name for those dependencies as well.
- `output.onlyExplicitManualChunks` now also applies to the object form and is no longer deprecated.

Manual chunks where none of the assigned modules are included in the bundle are no longer emitted. This can happen when you list a pure re-export barrel file whose exports are all imported directly. Rollup now emits an `EMPTY_MANUAL_CHUNK` warning in that case. If you relied on such a chunk, point it at the modules that are actually included, or remove it.

### Update code that imports the same file with different attributes

Import attributes are now part of module identity: importing the same resolved file with different attributes creates separate module instances instead of emitting the `INCONSISTENT_IMPORT_ATTRIBUTES` warning, which has been removed. Remove any logic that filters or handles that warning.

If you relied on a single module instance for a file that is imported with different attributes, for example to share state or to deduplicate code, make sure all imports use the same attributes. If you import the same external module with different attributes and use the object form of `output.globals`, switch to the function form to give each variant its own global name; otherwise Rollup emits an `AMBIGUOUS_GLOBAL_NAME` warning. For the plugin-facing consequences, see [Match module ids by `rawId`](#match-module-ids-by-rawid).

### Adopt the `with` import attributes keyword

Rollup now renders import attributes with `with` by default instead of `assert`, regardless of the keyword used in the source. This also applies when Rollup bundles your config file via `--configPlugin` or `--bundleConfigAsCjs`.

If you target an environment that does not understand `with`, set [`output.importAttributesKey: "assert"`](../configuration-options/index.md#output-importattributeskey), or pass `--configImportAttributesKey assert` for config files. Note that `output.importAttributesKey` is deprecated and will be removed in a future version, so prefer updating the target environment over setting the option.

The deprecated `output.externalImportAssertions` option has been removed. Use [`output.externalImportAttributes`](../configuration-options/index.md#output-externalimportattributes) instead.

### Adapt to deduplicated emitted assets

When the same source is emitted several times without a `fileName`, a function-based [`output.assetFileNames`](../configuration-options/index.md#output-assetfilenames) is now called once per unique source and output instead of once per emission. The `names` and `originalFileNames` arrays of the resulting asset no longer contain duplicate entries.

If your `assetFileNames` function relied on being called once per emission, e.g. to generate unique names, make sure it produces a valid name when called only once for the deduplicated source.

The deprecated `name` and `originalFileName` properties of emitted assets now emit a `DEPRECATED_FEATURE` warning when accessed and are non-enumerable. This affects asset objects in [`output.assetFileNames`](../configuration-options/index.md#output-assetfilenames), [`generateBundle`](../plugin-development/index.md#generatebundle) and [`writeBundle`](../plugin-development/index.md#writebundle). Use `names` and `originalFileNames` instead. Because the properties are non-enumerable, `Object.keys`, spreading and `JSON.stringify` no longer include them. The `name` option of assets passed to `this.emitFile` is unaffected.

### Account for `maxParallelFileOps` limiting file operations

[`maxParallelFileOps`](../configuration-options/index.md#maxparallelfileops) now limits the number of parallel file operations performed via the [`fs`](../configuration-options/index.md#fs) option and [`this.fs`](../plugin-development/index.md#this-fs) instead of the number of parallel `load` hooks. If you tuned it to control `load` concurrency, that no longer works; limit concurrency inside your `load` hook instead.

Plugin authors should perform all file operations through `this.fs` so they are counted; see [Route file operations through `this.fs`](#route-file-operations-through-this-fs).

### Replace removed watch options

Rollup now bundles chokidar 6. Since chokidar 4, glob patterns and the native macOS `fsevents` backend are no longer supported:

- Glob patterns in [`watch.chokidar`](../configuration-options/index.md#watch-chokidar) options such as `ignored` are now treated as literal paths. Use regular expressions, matcher functions or explicit paths instead. [`watch.include`](../configuration-options/index.md#watch-include) and [`watch.exclude`](../configuration-options/index.md#watch-exclude) still support glob patterns:

```js
export default {
	watch: {
		chokidar: {
			ignored: [/node_modules/, /\.git/]
		}
	}
};
```

- The `useFsEvents` option has been removed. Without `fsevents`, watching large projects on macOS can exceed the open-file limit; if that happens, set `backend: "polling"` instead.
- The `disableGlobbing` option has been removed; remove it from your configuration.
- The `ChokidarOptions` type now matches chokidar 6, so `ignored` is typed as a list of paths, regular expressions, matcher functions or `{ path, recursive }` objects instead of `any`. TypeScript may now flag glob strings or other invalid values; replace them as shown above.
- Invalid `watch.chokidar` values such as an unknown `backend` or non-positive polling intervals now throw a `TypeError` when the watcher is created. Fix any invalid values.

### Adapt cache serialization

The cache now stores the AST of each module as a binary buffer in `astBuffer` instead of a JSON representation in `ast`. Caches created by Rollup 4 can no longer be read, so discard them when upgrading.

`bundle.cache` is no longer purely JSON serializable as it contains typed arrays. If you store it outside the build process, use a serializer that supports typed arrays such as `v8.serialize` instead of `JSON.stringify`.

If you type caches, the `ModuleJSON` type has been replaced by `CachedModule`, and `TransformModuleJSON` has been replaced by `ModuleSource`.

## Changes to the Plugin Interface

### Match module ids by `rawId`

Because import attributes are part of module identity, the `id` of a module with import attributes now encodes them as a URL search parameter, e.g. `/src/data.json?attributes=%7B%22type%22%3A%22json%22%7D`. The id without encoded attributes is available as `rawId`.

If your plugin matches module ids in [`load`](../plugin-development/index.md#load), [`transform`](../plugin-development/index.md#transform) or [`shouldTransformCachedModule`](../plugin-development/index.md#shouldtransformcachedmodule), match on the `rawId` option these hooks now receive. In [`resolveId`](../plugin-development/index.md#resolveid) and [`resolveDynamicImport`](../plugin-development/index.md#resolvedynamicimport), use `importerRawId`. If your `load` hook reads the file at `id` from disk, read the file at `options.rawId` instead. Alternatively, allow a query suffix in your id filter, e.g. use `/\.json($|\?)/` instead of `/\.json$/`.

The same applies to the `id` of the entries of `importedIdResolutions` and `dynamicallyImportedIdResolutions`, which now have the new `ResolvedImport` type with a `rawId` property. If your plugin returns such an entry from [`resolveId`](../plugin-development/index.md#resolveid) or [`resolveDynamicImport`](../plugin-development/index.md#resolvedynamicimport), return `{ ...resolution, id: resolution.rawId }` instead, as Rollup would otherwise encode the attributes a second time.

If you typed against `ModuleOptions['attributes']`, use `ModuleInfo['attributes']` instead; attributes are determined in `resolveId` and can no longer be passed from `load` or `transform`. In output hooks, when matching file paths, use `facadeModuleRawId` instead of `facadeModuleId`, and the `rawId` of `RenderedModule` instead of ids that may contain encoded attributes.

The function forms of [`external`](../configuration-options/index.md#external), [`output.globals`](../configuration-options/index.md#output-globals) and [`output.paths`](../configuration-options/index.md#output-paths) receive the import `attributes` in an additional argument, which lets you distinguish variants that the object forms cannot.

### Update hook options and attribute handling

- The `load` and `transform` hooks no longer receive the Vite-specific `ssr` option, which Rollup never filled. Remove any `options.ssr` usage.
- In [`resolveFileUrl`](../plugin-development/index.md#resolvefileurl) and [`resolveImportMeta`](../plugin-development/index.md#resolveimportmeta), the `attributes` option has been renamed to `moduleAttributes`, and `moduleRawId` was added.
- [`renderDynamicImport`](../plugin-development/index.md#renderdynamicimport) now receives `moduleRawId` and `moduleAttributes` for the importing module, and `targetModuleRawId` alongside `targetModuleAttributes`.
- The `importerAttributes` option of [`this.resolve`](../plugin-development/index.md#this-resolve) is deprecated. Pass the importer as `{ rawId, attributes }` instead. [`this.resolve`](../plugin-development/index.md#this-resolve), [`this.load`](../plugin-development/index.md#this-load), [`this.getModuleInfo`](../plugin-development/index.md#this-getmoduleinfo) and the `importer` and `implicitlyLoadedAfterOneOf` options of [`this.emitFile`](../plugin-development/index.md#this-emitfile) also accept these objects.
- The `attributes` option of [`this.load`](../plugin-development/index.md#this-load) now determines which module is loaded instead of only being applied if the module was not loaded yet, so loading a module that was imported without attributes with `attributes` creates a separate module. If the id encodes different attributes, e.g. a composite `moduleInfo.id`, `this.load` throws a `CONFLICTING_MODULE_ATTRIBUTES` error.
- Returning `attributes` from [`load`](../plugin-development/index.md#load) or [`transform`](../plugin-development/index.md#transform) is ignored and emits a `DEPRECATED_FEATURE` warning. Attributes are determined at resolution time, so return only the code or AST.

### Switch to Rollup's AST types

Rollup now exposes its own generated AST types through the `ast` namespace instead of the `estree` types. Update your type imports:

```ts
import type { ast } from 'rollup';

function isIdentifier(node: ast.AstNode): node is ast.Identifier {
	return node.type === 'Identifier';
}
```

- The top-level `AstNode` type has been removed. See [Known AST nodes and TypeScript support](../plugin-development/index.md#known-ast-nodes-and-typescript-support) for the `ast` namespace.
- JSX nodes are now strongly typed instead of `any`. Remove `any` casts and fix any type errors this surfaces.
- The `ResolveIdResultWithoutNullValue` type has been removed; use `Exclude<ResolveIdResult, NullValue>` instead.
- The annotation properties of AST nodes have been renamed from `_rollupAnnotations` to `annotations` and from `_rollupRemoved` to `invalidAnnotations`.
- `TemplateElement.value.cooked` is now `undefined` instead of `null` when there is no cooked value.
- `phase` is now always present at runtime on import declarations and dynamic imports, with the value `undefined` when there is no import phase. Check for `undefined` instead of using `'phase' in node`.

### Avoid relying on AST object identity or mutation

`moduleInfo.ast` now returns a new lazy AST on each access, and its nested properties are materialized only when accessed. Mutating the AST is no longer supported: changes are not persisted and may throw. The `ast` passed to [`shouldTransformCachedModule`](../plugin-development/index.md#shouldtransformcachedmodule) is lazy as well. Store a reference if you access the AST several times, and copy nodes before modifying them.

If you need to inspect many nodes, use the [`this.parseAndWalk`](../plugin-development/index.md#this-parseandwalk) plugin context method or the `parseAndWalk` helper from `rollup/parseAst` instead; they only create objects for visited nodes. With `collectScopes: true`, visitor handlers receive a scope that can replace `attachScopes` from `@rollup/pluginutils`; see [Scope collection](../plugin-development/index.md#scope-collection).

### Stop returning ASTs from `load` and `transform`

ASTs returned from [`load`](../plugin-development/index.md#load) or [`transform`](../plugin-development/index.md#transform) are now serialized into a binary buffer before Rollup uses them. This has a performance cost and should be avoided where possible.

Serialization also discards extra properties of AST nodes and throws a `CANNOT_SERIALIZE_AST` error for node types Rollup does not know, so custom AST nodes are no longer supported. Return code instead, or use `this.parseAndWalk` to inspect nodes without building an AST.

### Update AST helper usage

- The `signal` option of `parseAstAsync` has been removed. Parsing cannot be aborted once it has started, so remove the option and handle cancellation outside the call.
- If you work with binary AST buffers, use the new `parseLazyAst`, `parseLazyAstAsync`, `deserializeAst`, `deserializeLazyAst` and `serializeAst` helpers from `rollup/parseAst`. See [AST serialization](../javascript-api/index.md#ast-serialization).

### Route file operations through `this.fs`

Because `maxParallelFileOps` now only counts operations that go through the [`fs`](../configuration-options/index.md#fs) option or [`this.fs`](../plugin-development/index.md#this-fs) (see above), operations that bypass them, e.g. by importing `node:fs` directly, are no longer throttled and may exceed the operating system's limit for open files. Use `this.fs` for all file operations in your plugin.

`this.fs` and `options.fs` now expose exactly the methods of the `RollupFsModule` interface; extra methods of the underlying implementation no longer leak through. Custom file system implementations must not call back into the `fs` exposed by Rollup, as nested calls can stall the build. The `fs` option is no longer experimental.

## Migrating to Rollup 4

This is a list of the most important topics you may encounter when migrating from Rollup 3 to Rollup 4. For a full list of breaking changes, we advise you to consult the

- [Rollup 4 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#400)

For how to migrate from earlier versions, [see below](#migrating-to-rollup-3).

## Prerequisites

Make sure you run at least Node 18.0.0 and update all your Rollup plugins to their latest versions.

For larger configs, it can make sense to update to `rollup@3.29.4` first, add the [`strictDeprecations`](../configuration-options/index.md#strictdeprecations) option to your config and resolve any errors that pop up. That way you can make sure you do not rely on features that may have been removed in Rollup 4. If you have errors in your plugins, please contact the plugin author.

## General Changes

Rollup now includes native code that is automatically installed (and removed) as an [optional npm dependency](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#optionaldependencies) if your platform and architecture is supported. More precisely, Rollup has a list of `optionalDependencies`, each of which only install on a specific [`os`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#os) and [`cpu`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#cpu). If your system is not supported, you will receive an error message when starting Rollup that will tell you about your platform and architecture and gives you a list of supported ones. In that case, you can instead use `@rollup/wasm-node` as a platform-independent drop-in replacement.

The browser build (`@rollup/browser` on NPM) now relies on a WASM artifact that needs to be provided as well. If you are using the browser build with Vite, you'll need to add `"@rollup/browser"` to `optimizeDeps.exclude`, otherwise `npm run dev` fails with an invalid path to the `.wasm` file (see also [vitejs #14609](https://github.com/vitejs/vite/issues/14609)). Otherwise it should work without any specific intervention.

Otherwise, an obvious change is that Rollup now uses url-safe base64 hashes in file names instead of the older base16 hashes. This provides more hash safety but means that hash length is now limited to at most 21 characters for technical reasons.

When bundling CLI apps, Rollup will now automatically preserve shebang comments in entry files if the output [`format`](../configuration-options/index.md#output-format) is `es` or `cjs`. Previously, you would have needed to add the comment via a plugin.

Last, you may see some new warnings about invalid annotation positions. Rollup will now warn if it finds a [`@__PURE__`](../configuration-options/index.md#pure) or [`@__NO_SIDE_EFFECTS__`](../configuration-options/index.md#no-side-effects) comment that it cannot interpret as it is in an invalid location. These warnings are meant to help debugging. To silence them, the [`--filter-logs`](../command-line-interface/index.md#filterlogs-filter) CLI option can help you.

## Configuration Changes

While some options that were already deprecated in Rollup 3 have been removed, the only major change here is that we no longer have the `acorn` and `acornInjectPlugin` options available. This means, unfortunately, that you can no longer add plugins for unsupported syntax. Depending on demand, we consider supporting JSX syntax again as the SWC parser would support that.

## Changes to the Plugin API

An important change is that [`this.resolve()`](../plugin-development/index.md#this-resolve) will now by default add `skipSelf: true`. That means when calling `this.resolve()` from a [`resolveId`](../plugin-development/index.md#resolveid) hook, this hook will not be called again by this or further nested `this.resolve()` calls from other plugins unless they use a different `source` or `importer`. We found that this is a reasonable default for most plugins that prevents unintended infinite loops. To get the old behaviour, you can manually add `skipSelf: false`.

Another important change is that Rollup watch mode will no longer watch ids of files that have been loaded via a plugin [`load`](../plugin-development/index.md#load) hook. So this mainly affects "virtual" files, where it really does not make sense to watch a hard drive location for changes. Instead, it is now up to plugins that use a `load` hook to manually call [`this.addWatchFile()`](../plugin-development/index.md#this-addwatchfile) for all the files they depend on to handle the `load` hook.

If your plugin handles import assertions, note that in the [`resolveId`](../plugin-development/index.md#resolveid) hook and other places, `assertions` have been replaced with `attributes` as the JavaScript feature was also renamed. Also, the abstract syntax tree representation of import attributes now follows the [ESTree spec](https://github.com/estree/estree/blob/7a0c8fb02a33a69fa16dbe3ca35beeaa8f58f1e3/experimental/import-attributes.md) again.

If you want to emit warnings from your plugin, you can no longer call `options.onwarn()` in the [`buildStart`](../plugin-development/index.md#buildstart) hook. Instead, either use [`this.warn()`](../plugin-development/index.md#load) or [`options.onLog()`](../configuration-options/index.md#onlog).

## Migrating to Rollup 3

This is a list of the most important topics you may encounter when migrating from Rollup 2 to Rollup 3. For a full list of breaking changes, we advise you to consult the

- [Rollup 3 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#300)

When migrating from Rollup 1 or earlier, see also

- [Rollup 2 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#200)
- [Rollup 1 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#100)

### Prerequisites

Make sure you run at least Node 14.18.0 and update all your Rollup plugins to their latest versions.

For larger configs, it can make sense to update to `rollup@2.79.1` first, add the [`strictDeprecations`](../configuration-options/index.md#strictdeprecations) option to your config and resolve any errors that pop up. That way you can make sure you do not rely on features that may have been removed in Rollup 3. If you have errors in your plugins, please contact the plugin author.

### Using Configuration Files

If you are using an ES module as configuration file, i.e. `import` and `export` syntax, you need to make sure Node will be loading your configuration as an ES module.

The easiest way to ensure that is to change the file extension to `.mjs`, see also [Configuration Files](../command-line-interface/index.md#configuration-files).

There are some additional caveats when using native Node ES modules, most notably

- you cannot simply import your `package.json` file
- you cannot use `__dirname` to get the current directory

[Caveats when using native Node ES modules](../command-line-interface/index.md#caveats-when-using-native-node-es-modules) will give you some alternatives for how to handle these things.

Alternatively you can pass the [`--bundleConfigAsCjs`](../command-line-interface/index.md#bundleconfigascjs) option to force the old loading behavior.

If you use the [`--configPlugin`](../command-line-interface/index.md#configplugin-plugin) option, Rollup will now bundle your configuration as an ES module instead of CommonJS before running it. This allows you to easily import ES modules from your configuration but has the same caveats as using a native ES module, e.g. `__dirname` will no longer work. Again, you can pass the [`--bundleConfigAsCjs`](../command-line-interface/index.md#bundleconfigascjs) option to force the old loading behavior.

### Changed Defaults

Some options now have different default values. If you think you experience any issues, try adding the following to your configuration:

```js
({
	makeAbsoluteExternalsRelative: true,
	preserveEntrySignatures: 'strict',
	output: {
		esModule: true,
		generatedCode: {
			reservedNamesAsProps: false
		},
		interop: 'compat',
		systemNullSetters: false
	}
});
```

In general, though, the new default values are our recommended settings. Refer to the documentation of each setting for more details.

### More Changed Options

- [`output.banner/footer`](../configuration-options/index.md#output-banner-output-footer)[`/intro/outro`](../configuration-options/index.md#output-intro-output-outro) are now called per chunk and thus should not do any performance-heavy operations.
- [`entryFileNames`](../configuration-options/index.md#output-entryfilenames) and [`chunkFileNames`](../configuration-options/index.md#output-chunkfilenames) functions no longer have access to the rendered module information via `modules`, but only to a list of included `moduleIds`.
- When using [`output.preserveModules`](../configuration-options/index.md#output-preservemodules) and `entryFileNames`, you can no longer use the `[ext]`, `[extName]` and `[assetExtName]` file name placeholders. Also, the path of a module is no longer prepended to the file name automatically but is included in the `[name]` placeholder.

### Dynamic Import in CommonJS Output

By default, when generating `cjs` output, Rollup will now keep any external, i.e. non-bundled, dynamic imports as `import(…)` expressions in the output. This is supported in all Node versions starting with Node 14 and allows to load both CommonJS and ES modules from generated CommonJS output. If you need to support older Node versions, you can pass [`output.dynamicImportInCjs: false`](../configuration-options/index.md#output-dynamicimportincjs).

### Changes to the Plugin API

Then general output generation flow has been reworked, see the [Output Generation Hooks](../plugin-development/index.md#output-generation-hooks) graph for the new plugin hook order. Probably the most obvious change is that the [`banner`](../plugin-development/index.md#banner)/[`footer`](../plugin-development/index.md#footer)/[`intro`](../plugin-development/index.md#intro)/[`outro`](../plugin-development/index.md#outro) are no longer invoked once at the beginning but rather per chunk. On the other hand, [`augmentChunkHash`](../plugin-development/index.md#augmentchunkhash) is now evaluated after [`renderChunk`](../plugin-development/index.md#renderchunk) when the hash is created.

As file hashes are now based on the actual content of the file after `renderChunk`, we no longer know exact file names before hashes are generated. Instead, the logic now relies on hash placeholders of the form `!~{001}~`. That means that all file names available to the `renderChunk` hook may contain placeholders and may not correspond to the final file names. This is not a problem though if you plan on using these files names within the chunks as Rollup will replace all placeholders before [`generateBundle`](../plugin-development/index.md#generatebundle) runs.

Not necessarily a breaking change, but plugins that add or remove imports in [`renderChunk`](../plugin-development/index.md#renderchunk) should make sure they also update the corresponding `chunk` information that is passed to this hook. This will enable other plugins to rely on accurate chunk information without the need to pare the chunk themselves. See the [documentation](../plugin-development/index.md#renderchunk) of the hook for more information.
