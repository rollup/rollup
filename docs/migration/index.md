---
title: Migrating to Rollup 4
---

# {{ $frontmatter.title }}

[[toc]]

This is a list of the most important topics you may encounter when migrating from Rollup 3 to Rollup 4. For a full list of breaking changes, we advise you to consult the

- [Rollup 4 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#400)

For how to migrate from earlier versions, [see below](#migrating-to-rollup-3).

## Prerequisites

Make sure you run at least Node 18.0.0 and update all your Rollup plugins to their latest versions.

For larger configs, it can make sense to update to `rollup@3.29.4` first, add the [`strictDeprecations`](../configuration-options/index.md#strictdeprecations) option to your config and resolve any errors that pop up. That way you can make sure you do not rely on features that may have been removed in Rollup 4. If you have errors in your plugins, please contact the plugin author.

## General Changes

Rollup now includes native code that is automatically installed (and removed) as an [optional npm dependency](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#optionaldependencies) if your platform and architecture is supported. More precisely, Rollup has a list of `optionalDependencies`, each of which only install on a specific [`os`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#os) and [`cpu`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#cpu). If your system is not supported, you will receive an error message when starting Rollup that will tell you about your platform and architecture and gives you a list of supported ones. In that case, you can instead use `@rollup/wasm-node` as a platform-independent drop-in replacement.

Otherwise, an obvious change is that Rollup now uses url-safe base64 hashes in file names instead of the older base16 hashes. This provides more hash safety but means that hash length is now limited to at most 22 characters for technical reasons.

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
