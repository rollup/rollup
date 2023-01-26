---
title: Migrating to Rollup 3
---

# {{ $frontmatter.title }}

[[toc]]

This is a list of the most important topics you may encounter when migrating to Rollup 3. For a full list of breaking changes, we advise you to consult the

- [Rollup 3 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#300)

When migrating from Rollup 1 or earlier, see also

- [Rollup 2 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#200)
- [Rollup 1 changelog](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#100)

## Prerequisites

Make sure you run at least Node 14.18.0 and update all your Rollup plugins to their latest versions.

For larger configs, it can make sense to update to `rollup@2.79.1` first, add the [`strictDeprecations`](../configuration-options/index.md#strictdeprecations) option to your config and resolve any errors that pop up. That way you can make sure you do not rely on features that may have been removed in Rollup 3. If you have errors in your plugins, please contact the plugin author.

## Using Configuration Files

If you are using an ES module as configuration file, i.e. `import` and `export` syntax, you need to make sure Node will be loading your configuration as an ES module.

The easiest way to ensure that is to change the file extension to `.mjs`, see also [Configuration Files](../command-line-interface/index.md#configuration-files).

There are some additional caveats when using native Node ES modules, most notably

- you cannot simply import your `package.json` file
- you cannot use `__dirname` to get the current directory

[Caveats when using native Node ES modules](../command-line-interface/index.md#caveats-when-using-native-node-es-modules) will give you some alternatives for how to handle these things.

Alternatively you can pass the [`--bundleConfigAsCjs`](../command-line-interface/index.md#bundleconfigascjs) option to force the old loading behavior.

If you use the [`--configPlugin`](../command-line-interface/index.md#configplugin-plugin) option, Rollup will now bundle your configuration as an ES module instead of CommonJS before running it. This allows you to easily import ES modules from your configuration but has the same caveats as using a native ES module, e.g. `__dirname` will no longer work. Again, you can pass the [`--bundleConfigAsCjs`](../command-line-interface/index.md#bundleconfigascjs) option to force the old loading behavior.

## Changed Defaults

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

## More Changed Options

- [`output.banner/footer`](../configuration-options/index.md#output-banner-output-footer)[`/intro/outro`](../configuration-options/index.md#output-intro-output-outro) are now called per chunk and thus should not do any performance-heavy operations.
- [`entryFileNames`](../configuration-options/index.md#output-entryfilenames) and [`chunkFileNames`](../configuration-options/index.md#output-chunkfilenames) functions no longer have access to the rendered module information via `modules`, but only to a list of included `moduleIds`.
- When using [`output.preserveModules`](../configuration-options/index.md#output-preservemodules) and `entryFileNames`, you can no longer use the `[ext]`, `[extName]` and `[assetExtName]` file name placeholders. Also, the path of a module is no longer prepended to the file name automatically but is included in the `[name]` placeholder.

## Dynamic Import in CommonJS Output

By default, when generating `cjs` output, Rollup will now keep any external, i.e. non-bundled, dynamic imports as `import(…)` expressions in the output. This is supported in all Node versions starting with Node 14 and allows to load both CommonJS and ES modules from generated CommonJS output. If you need to support older Node versions, you can pass [`output.dynamicImportInCjs: false`](../configuration-options/index.md#output-dynamicimportincjs).

## Changes to the Plugin API

Then general output generation flow has been reworked, see the [Output Generation Hooks](../plugin-development/index.md#output-generation-hooks) graph for the new plugin hook order. Probably the most obvious change is that the [`banner`](../plugin-development/index.md#banner)/[`footer`](../plugin-development/index.md#footer)/[`intro`](../plugin-development/index.md#intro)/[`outro`](../plugin-development/index.md#outro) are no longer invoked once at the beginning but rather per chunk. On the other hand, [`augmentChunkHash`](../plugin-development/index.md#augmentchunkhash) is now evaluated after [`renderChunk`](../plugin-development/index.md#renderchunk) when the hash is created.

As file hashes are now based on the actual content of the file after `renderChunk`, we no longer know exact file names before hashes are generated. Instead, the logic now relies on hash placeholders of the form `!~{001}~`. That means that all file names available to the `renderChunk` hook may contain placeholders and may not correspond to the final file names. This is not a problem though if you plan on using these files names within the chunks as Rollup will replace all placeholders before [`generateBundle`](../plugin-development/index.md#generatebundle) runs.

Not necessarily a breaking change, but plugins that add or remove imports in [`renderChunk`](../plugin-development/index.md#renderchunk) should make sure they also update the corresponding `chunk` information that is passed to this hook. This will enable other plugins to rely on accurate chunk information without the need to pare the chunk themselves. See the [documentation](../plugin-development/index.md#renderchunk) of the hook for more information.
