---
title: Plugin Development
---

# {{ $frontmatter.title }}

[[toc]]

## Plugins Overview

A Rollup plugin is an object with one or more of the [properties](#properties), [build hooks](#build-hooks), and [output generation hooks](#output-generation-hooks) described below, and which follows our [conventions](#conventions). A plugin should be distributed as a package which exports a function that can be called with plugin specific options and returns such an object.

Plugins allow you to customise Rollup's behaviour by, for example, transpiling code before bundling, or finding third-party modules in your `node_modules` folder. For an example on how to use them, see [Using plugins](../tutorial/index.md#using-plugins).

A List of Plugins may be found at [github.com/rollup/awesome](https://github.com/rollup/awesome). If you would like to make a suggestion for a plugin, please submit a Pull Request.

## A Simple Example

The following plugin will intercept any imports of `virtual-module` without accessing the file system. This is for instance necessary if you want to use Rollup in a browser. It can even be used to replace entry points as shown in the example.

```js twoslash
// @filename: rollup-plugin-my-example.js
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
export default function myExample () {
  return {
    name: 'my-example', // this name will show up in logs and errors
    resolveId ( source ) {
      if (source === 'virtual-module') {
        // this signals that Rollup should not ask other plugins or check
        // the file system to find this id
        return source;
      }
      return null; // other ids should be handled as usually
    },
    load ( id ) {
      if (id === 'virtual-module') {
        // the source code for "virtual-module"
        return 'export default "This is virtual!"';
      }
      return null; // other ids should be handled as usually
    }
  };
}

// @filename: rollup.config.js
import myExample from './rollup-plugin-my-example.js';
export default ({
  input: 'virtual-module', // resolved by our plugin
  plugins: [myExample()],
  output: [{
    file: 'bundle.js',
    format: 'es'
  }]
});
```

## Conventions

- Plugins should have a clear name with `rollup-plugin-` prefix.
- Include `rollup-plugin` keyword in `package.json`.
- Plugins should be tested. We recommend [mocha](https://github.com/mochajs/mocha) or [ava](https://github.com/avajs/ava) which support Promises out of the box.
- Use asynchronous methods when it is possible, e.g. `fs.readFile` instead of `fs.readFileSync`.
- Document your plugin in English.
- Make sure your plugin outputs correct source mappings if appropriate.
- If your plugin uses 'virtual modules' (e.g. for helper functions), prefix the module ID with `\0`. This prevents other plugins from trying to process it.

## Properties

### name

|       |          |
| ----: | :------- |
| Type: | `string` |

The name of the plugin, for use in error messages and logs.

### version

|       |          |
| ----: | :------- |
| Type: | `string` |

The version of the plugin, for use in inter-plugin communication scenarios.

## Build Hooks

To interact with the build process, your plugin object includes "hooks". Hooks are functions which are called at various stages of the build. Hooks can affect how a build is run, provide information about a build, or modify a build once complete. There are different kinds of hooks:

- `async`: The hook may also return a Promise resolving to the same type of value; otherwise, the hook is marked as `sync`.
- `first`: If several plugins implement this hook, the hooks are run sequentially until a hook returns a value other than `null` or `undefined`.
- `sequential`: If several plugins implement this hook, all of them will be run in the specified plugin order. If a hook is `async`, subsequent hooks of this kind will wait until the current hook is resolved.
- `parallel`: If several plugins implement this hook, all of them will be run in the specified plugin order. If a hook is `async`, subsequent hooks of this kind will be run in parallel and not wait for the current hook.

Instead of a function, hooks can also be objects. In that case, the actual hook function (or value for `banner/footer/intro/outro`) must be specified as `handler`. This allows you to provide additional optional properties that change hook execution:

- `order: "pre" | "post" | null`<br> If there are several plugins implementing this hook, either run this plugin first (`"pre"`), last (`"post"`), or in the user-specified position (no value or `null`).

  ```js twoslash
  // ---cut-start---
  /** @returns {import('rollup').Plugin} */
  // ---cut-end---
  export default function resolveFirst() {
  	return {
  		name: 'resolve-first',
  		resolveId: {
  			order: 'pre',
  			handler(source) {
  				if (source === 'external') {
  					return { id: source, external: true };
  				}
  				return null;
  			}
  		}
  	};
  }
  ```

  If several plugins use `"pre"` or `"post"`, Rollup runs them in the user-specified order. This option can be used for all plugin hooks. For parallel hooks, it changes the order in which the synchronous part of the hook is run.

- `sequential: boolean`<br> Do not run this hook in parallel with the same hook of other plugins. Can only be used for `parallel` hooks. Using this option will make Rollup await the results of all previous plugins, then execute the plugin hook, and then run the remaining plugins in parallel again. E.g. when you have plugins `A`, `B`, `C`, `D`, `E` that all implement the same parallel hook and the middle plugin `C` has `sequential: true`, then Rollup will first run `A + B` in parallel, then `C` on its own, then `D + E` in parallel.

  This can be useful when you need to run several command line tools in different [`writeBundle`](#writebundle) hooks that depend on each other (note that if possible, it is recommended to add/remove files in the sequential [`generateBundle`](#generatebundle) hook, though, which is faster, works with pure in-memory builds and permits other in-memory build plugins to see the files). You can combine this option with `order` for additional sorting.

  ```js twoslash
  import path from 'node:path';
  import { readdir } from 'node:fs/promises';

  // ---cut-start---
  /** @returns {import('rollup').Plugin} */
  // ---cut-end---
  export default function getFilesOnDisk() {
  	return {
  		name: 'getFilesOnDisk',
  		writeBundle: {
  			sequential: true,
  			order: 'post',
  			async handler({ dir }) {
  				const topLevelFiles = await readdir(path.resolve(dir));
  				console.log(topLevelFiles);
  			}
  		}
  	};
  }
  ```

Build hooks are run during the build phase, which is triggered by `rollup.rollup(inputOptions)`. They are mainly concerned with locating, providing and transforming input files before they are processed by Rollup. The first hook of the build phase is [`options`](#options), the last one is always [`buildEnd`](#buildend). If there is a build error, [`closeBundle`](#closebundle) will be called after that.

<style>
.legend-grid {
	display: grid;
	grid-template-columns: max-content max-content;
	grid-column-gap: 16px;
}

.legend-rect {
	display: inline-block;
	width: 16px;
	height: 16px;
	border-radius: 5px;
	border: 1px solid #000;
	vertical-align: middle;
	margin-right: 5px;
	background: #fff;
}
</style>

<div class="legend-grid">
	<div style="grid-column: 1; grid-row: 1">
		<span class="legend-rect" style="background: #ffb3b3"></span>parallel
	</div>
	<div style="grid-column: 1; grid-row: 2">
		<span class="legend-rect" style="background: #ffd2b3"></span>sequential
	</div>
	<div style="grid-column: 1; grid-row: 3">
		<span class="legend-rect" style="background: #fff2b3"></span>first
	</div>
	<div style="grid-column: 2; grid-row: 1">
		<span class="legend-rect" style="border-color: #000"></span>async
	</div>
	<div style="grid-column: 2; grid-row: 2">
		<span class="legend-rect" style="border-color: #f00"></span>sync
	</div>
</div>

```mermaid
flowchart TB
    classDef default fill:transparent, color:#000;
    classDef hook-parallel fill:#ffb3b3,stroke:#000;
    classDef hook-sequential fill:#ffd2b3,stroke:#000;
    classDef hook-first fill:#fff2b3,stroke:#000;
    classDef hook-sequential-sync fill:#ffd2b3,stroke:#f00;
    classDef hook-first-sync fill:#fff2b3,stroke:#f00;

	watchchange("watchChange"):::hook-parallel
	click watchchange "#watchchange" _parent

    closewatcher("closeWatcher"):::hook-parallel
	click closewatcher "#closewatcher" _parent

	buildend("buildEnd"):::hook-parallel
	click buildend "#buildend" _parent

    buildstart("buildStart"):::hook-parallel
	click buildstart "#buildstart" _parent

	load("load"):::hook-first
	click load "#load" _parent

	moduleparsed("moduleParsed"):::hook-parallel
	click moduleparsed "#moduleparsed" _parent

	options("options"):::hook-sequential
	click options "#options" _parent

	resolvedynamicimport("resolveDynamicImport"):::hook-first
	click resolvedynamicimport "#resolvedynamicimport" _parent

	resolveid("resolveId"):::hook-first
	click resolveid "#resolveid" _parent

	shouldtransformcachedmodule("shouldTransformCachedModule"):::hook-first
	click shouldtransformcachedmodule "#shouldtransformcachedmodule" _parent

	transform("transform"):::hook-sequential
	click transform "#transform" _parent

    options
    --> buildstart
    --> |each entry|resolveid
    .-> |external|buildend

    resolveid
    --> |non-external|load
    --> |not cached|transform
    --> moduleparsed
    .-> |no imports|buildend

    load
    --> |cached|shouldtransformcachedmodule
    --> |false|moduleparsed

    shouldtransformcachedmodule
    --> |true|transform

    moduleparsed
    --> |"each import()"|resolvedynamicimport
    --> |non-external|load

    moduleparsed
    --> |"each import\n(cached)"|load

    moduleparsed
    --> |"each import\n(not cached)"|resolveid

    resolvedynamicimport
    .-> |external|buildend

    resolvedynamicimport
    --> |unresolved|resolveid
```

Additionally, in watch mode the [`watchChange`](#watchchange) hook can be triggered at any time to notify a new run will be triggered once the current run has generated its outputs. Also, when watcher closes, the [`closeWatcher`](#closewatcher) hook will be triggered.

See [Output Generation Hooks](#output-generation-hooks) for hooks that run during the output generation phase to modify the generated output.

### buildEnd

|  |  |
| --: | :-- |
| Type: | `(error?: Error) => void` |
| Kind: | async, parallel |
| Previous: | [`moduleParsed`](#moduleparsed), [`resolveId`](#resolveid) or [`resolveDynamicImport`](#resolvedynamicimport) |
| Next: | [`outputOptions`](#outputoptions) in the output generation phase as this is the last hook of the build phase |

Called when Rollup has finished bundling, but before `generate` or `write` is called; you can also return a Promise. If an error occurred during the build, it is passed on to this hook.

### buildStart

|  |  |
| --: | :-- |
| Type: | `(options: InputOptions) => void` |
| Kind: | async, parallel |
| Previous: | [`options`](#options) |
| Next: | [`resolveId`](#resolveid) to resolve each entry point in parallel |

Called on each `rollup.rollup` build. This is the recommended hook to use when you need access to the options passed to `rollup.rollup()` as it takes the transformations by all [`options`](#options) hooks into account and also contains the right default values for unset options.

### closeWatcher

|  |  |
| --: | :-- |
| Type: | `() => void` |
| Kind: | async, parallel |
| Previous/Next: | This hook can be triggered at any time both during the build and the output generation phases. If that is the case, the current build will still proceed but no new [`watchChange`](#watchchange) events will be triggered ever |

Notifies a plugin when the watcher process will close so that all open resources can be closed too. If a Promise is returned, Rollup will wait for the Promise to resolve before closing the process. This hook cannot be used by output plugins.

### load

|  |  |
| --: | :-- |
| Type: | `(id: string) => LoadResult` |
| Kind: | async, first |
| Previous: | [`resolveId`](#resolveid) or [`resolveDynamicImport`](#resolvedynamicimport) where the loaded id was resolved. Additionally, this hook can be triggered at any time from plugin hooks by calling [`this.load`](#this-load) to preload the module corresponding to an id |
| Next: | [`transform`](#transform) to transform the loaded file if no cache was used, or there was no cached copy with the same `code`, otherwise [`shouldTransformCachedModule`](#shouldtransformcachedmodule) |

```typescript
type LoadResult = string | null | SourceDescription;

interface SourceDescription {
	code: string;
	map?: string | SourceMap;
	ast?: ESTree.Program;
	attributes?: { [key: string]: string } | null;
	meta?: { [plugin: string]: any } | null;
	moduleSideEffects?: boolean | 'no-treeshake' | null;
	syntheticNamedExports?: boolean | string | null;
}
```

Defines a custom loader. Returning `null` defers to other `load` functions (and eventually the default behavior of loading from the file system). To prevent additional parsing overhead in case e.g. this hook already used [`this.parse`](#this-parse) to generate an AST for some reason, this hook can optionally return a `{ code, ast, map }` object. The `ast` must be a standard ESTree AST with `start` and `end` properties for each node. If the transformation does not move code, you can preserve existing sourcemaps by setting `map` to `null`. Otherwise, you might need to generate the source map. See the section on [source code transformations](#source-code-transformations).

If `false` is returned for `moduleSideEffects` and no other module imports anything from this module, then this module will not be included in the bundle even if the module would have side effects. If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side effects (such as modifying a global or exported variable). If `"no-treeshake"` is returned, treeshaking will be turned off for this module and it will also be included in one of the generated chunks even if it is empty. If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the first `resolveId` hook that resolved this module, the [`treeshake.moduleSideEffects`](../configuration-options/index.md#treeshake-modulesideeffects) option, or eventually default to `true`. The `transform` hook can override this.

`attributes` contain the import attributes that were used when this module was imported. At the moment, they do not influence rendering for bundled modules but rather serve documentation purposes. If `null` is returned or the flag is omitted, then `attributes` will be determined by the first `resolveId` hook that resolved this module, or the attributes present in the first import of this module. The `transform` hook can override this.

See [synthetic named exports](#synthetic-named-exports) for the effect of the `syntheticNamedExports` option. If `null` is returned or the flag is omitted, then `syntheticNamedExports` will be determined by the first `resolveId` hook that resolved this module or eventually default to `false`. The `transform` hook can override this.

See [custom module meta-data](#custom-module-meta-data) for how to use the `meta` option. If a `meta` object is returned by this hook, it will be merged shallowly with any `meta` object returned by the resolveId hook. If no hook returns a `meta` object it will default to an empty object. The `transform` hook can further add or replace properties of this object.

You can use [`this.getModuleInfo`](#this-getmoduleinfo) to find out the previous values of `attributes`, `meta`, `moduleSideEffects` and `syntheticNamedExports` inside this hook.

### moduleParsed

|  |  |
| --: | :-- |
| Type: | `(moduleInfo: ModuleInfo) => void` |
| Kind: | async, parallel |
| Previous: | [`transform`](#transform) where the currently handled file was transformed |
| Next: | [`resolveId`](#resolveid) and [`resolveDynamicImport`](#resolvedynamicimport) to resolve all discovered static and dynamic imports in parallel if present, otherwise [`buildEnd`](#buildend) |

This hook is called each time a module has been fully parsed by Rollup. See [`this.getModuleInfo`](#this-getmoduleinfo) for what information is passed to this hook.

In contrast to the [`transform`](#transform) hook, this hook is never cached and can be used to get information about both cached and other modules, including the final shape of the `meta` property, the `code` and the `ast`.

This hook will wait until all imports are resolved so that the information in `moduleInfo.importedIds`, `moduleInfo.dynamicallyImportedIds`, `moduleInfo.importedIdResolutions`, and `moduleInfo.dynamicallyImportedIdResolutions` is complete and accurate. Note however that information about importing modules may be incomplete as additional importers could be discovered later. If you need this information, use the [`buildEnd`](#buildend) hook.

### onLog

|                |                                                        |
| -------------: | :----------------------------------------------------- |
|          Type: | `(level: LogLevel, log: RollupLog) => boolean \| null` |
|          Kind: | sync, sequential                                       |
| Previous/Next: | This hook can be triggered at any time.                |

See the [`onLog`](../configuration-options/index.md#onlog) option for the available `Loglevel` values and the `RollupLog` type.

A function that receives and filters logs and warnings generated by Rollup and plugins before they are passed to the [`onLog`](../configuration-options/index.md#onlog) option or printed to the console.

If `false` is returned from this hook, the log will be filtered. Otherwise, the log will be handed to the `onLog` hook of the next plugin, the `onLog` option, or printed to the console. Plugins can also change the log level of a log or turn a log into an error by passing the log to [`this.error`](#this-error), [`this.warn`](#this-warn), [`this.info`](#this-info) or [`this.debug`](#this-debug) and returning `false`. Note that unlike other plugin hooks that add e.g. the plugin name to the log, those functions will not add or change properties of the log. Additionally, logs generated by an `onLog` hook will not be passed back to the `onLog` hook of the same plugin. If another plugin generates a log in response to such a log in its own `onLog` hook, this log will not be passed to the original `onLog` hook, either.

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function plugin1() {
	return {
		name: 'plugin1',
		buildStart() {
			this.info({ message: 'Hey', pluginCode: 'SPECIAL_CODE' });
		},
		onLog(level, log) {
			if (log.plugin === 'plugin1' && log.pluginCode === 'SPECIAL_CODE') {
				// We turn logs into warnings based on their code. This warnings
				// will not be passed back to the same plugin to avoid an
				// infinite loop, but other plugins will still receive it.
				this.warn(log);
				return false;
			}
		}
	};
}

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function plugin2() {
	return {
		name: 'plugin2',
		onLog(level, log) {
			if (log.plugin === 'plugin1' && log.pluginCode === 'SPECIAL_CODE') {
				// You can modify logs in this hooks as well
				log.meta = 'processed by plugin 2';
				// This turns the log back to "info". If this happens in
				// response to the first plugin, it will not be passed back to
				// either plugin to avoid an infinite loop. If both plugins are
				// active, the log will be an info log if the second plugin is
				// placed after the first one
				this.info(log);
				return false;
			}
		}
	};
}
```

Like the [`options`](#options) hook, this hook does not have access to most [plugin context](#plugin-context) utility functions as it may be run before Rollup is fully configured. The only supported properties are [`this.meta`](#this-meta) as well as [`this.error`](#this-error), [`this.warn`](#this-warn), [`this.info`](#this-info) and [`this.debug`](#this-debug) for logging and errors.

### options

|           |                                                   |
| --------: | :------------------------------------------------ |
|     Type: | `(options: InputOptions) => InputOptions \| null` |
|     Kind: | async, sequential                                 |
| Previous: | This is the first hook of the build phase         |
|     Next: | [`buildStart`](#buildstart)                       |

Replaces or manipulates the options object passed to `rollup.rollup`. Returning `null` does not replace anything. If you just need to read the options, it is recommended to use the [`buildStart`](#buildstart) hook as that hook has access to the options after the transformations from all `options` hooks have been taken into account.

Like the [`onLog`](#onlog) hook, this hook does not have access to most [plugin context](#plugin-context) utility functions as it is run before Rollup is fully configured. The only supported properties are [`this.meta`](#this-meta) as well as [`this.error`](#this-error), [`this.warn`](#this-warn), [`this.info`](#this-info) and [`this.debug`](#this-debug) for logging and errors.

### resolveDynamicImport

|  |  |
| --: | :-- |
| Type: | `ResolveDynamicImportHook` |
| Kind: | async, first |
| Previous: | [`moduleParsed`](#moduleparsed) for the importing file |
| Next: | [`load`](#load) if the hook resolved with an id that has not yet been loaded, [`resolveId`](#resolveid) if the dynamic import contains a string and was not resolved by the hook, otherwise [`buildEnd`](#buildend) |

```typescript
type ResolveDynamicImportHook = (
	specifier: string | AstNode,
	importer: string,
	options: { attributes: Record<string, string> }
) => ResolveIdResult;
```

::: tip

The return type **ResolveIdResult** is the same as that of the [`resolveId`](#resolveid) hook.

:::

Defines a custom resolver for dynamic imports. Returning `false` signals that the import should be kept as it is and not be passed to other resolvers thus making it external. Similar to the [`resolveId`](#resolveid) hook, you can also return an object to resolve the import to a different id while marking it as external at the same time.

`attributes` tells you which import attributes were present in the import. I.e. `import("foo", {assert: {type: "json"}})` will pass along `attributes: {type: "json"}`.

In case a dynamic import is passed a string as argument, a string returned from this hook will be interpreted as an existing module id while returning `null` will defer to other resolvers and eventually to `resolveId` .

In case a dynamic import is not passed a string as argument, this hook gets access to the raw AST nodes to analyze and behaves slightly different in the following ways:

- If all plugins return `null`, the import is treated as `external` without a warning.
- If a string is returned, this string is _not_ interpreted as a module id but is instead used as a replacement for the import argument. It is the responsibility of the plugin to make sure the generated code is valid.
- To resolve such an import to an existing module, you can still return an object `{id, external}`.

Note that the return value of this hook will not be passed to `resolveId` afterwards; if you need access to the static resolution algorithm, you can use [`this.resolve(source, importer)`](#this-resolve) on the plugin context.

### resolveId

|  |  |
| --: | :-- |
| Type: | `ResolveIdHook` |
| Kind: | async, first |
| Previous: | [`buildStart`](#buildstart) if we are resolving an entry point, [`moduleParsed`](#moduleparsed) if we are resolving an import, or as fallback for [`resolveDynamicImport`](#resolvedynamicimport). Additionally, this hook can be triggered during the build phase from plugin hooks by calling [`this.emitFile`](#this-emitfile) to emit an entry point or at any time by calling [`this.resolve`](#this-resolve) to manually resolve an id |
| Next: | [`load`](#load) if the resolved id has not yet been loaded, otherwise [`buildEnd`](#buildend) |

```typescript
type ResolveIdHook = (
	source: string,
	importer: string | undefined,
	options: {
		attributes: Record<string, string>;
		custom?: { [plugin: string]: any };
		isEntry: boolean;
	}
) => ResolveIdResult;

type ResolveIdResult = string | null | false | PartialResolvedId;

interface PartialResolvedId {
	id: string;
	external?: boolean | 'absolute' | 'relative';
	attributes?: Record<string, string> | null;
	meta?: { [plugin: string]: any } | null;
	moduleSideEffects?: boolean | 'no-treeshake' | null;
	resolvedBy?: string | null;
	syntheticNamedExports?: boolean | string | null;
}
```

Defines a custom resolver. A resolver can be useful for e.g. locating third-party dependencies. Here `source` is the importee exactly as it is written in the import statement, i.e. for

```js
import { foo } from '../bar.js';
```

the source will be `"../bar.js"`.

The `importer` is the fully resolved id of the importing module. When resolving entry points, importer will usually be `undefined`. An exception here are entry points generated via [`this.emitFile`](#this-emitfile) as here, you can provide an `importer` argument.

For those cases, the `isEntry` option will tell you if we are resolving a user defined entry point, an emitted chunk, or if the `isEntry` parameter was provided for the [`this.resolve`](#this-resolve) context function.

You can use this for instance as a mechanism to define custom proxy modules for entry points. The following plugin will proxy all entry points to inject a polyfill import.

```js twoslash
// We prefix the polyfill id with \0 to tell other plugins not to try to load or
// transform it
const POLYFILL_ID = '\0polyfill';
const PROXY_SUFFIX = '?inject-polyfill-proxy';

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function injectPolyfillPlugin() {
	return {
		name: 'inject-polyfill',
		async resolveId(source, importer, options) {
			if (source === POLYFILL_ID) {
				// It is important that side effects are always respected
				// for polyfills, otherwise using
				// "treeshake.moduleSideEffects: false" may prevent the
				// polyfill from being included.
				return { id: POLYFILL_ID, moduleSideEffects: true };
			}
			if (options.isEntry) {
				// Determine what the actual entry would have been.
				const resolution = await this.resolve(source, importer, options);
				// If it cannot be resolved or is external, just return it
				// so that Rollup can display an error
				if (!resolution || resolution.external) return resolution;
				// In the load hook of the proxy, we need to know if the
				// entry has a default export. There, however, we no longer
				// have the full "resolution" object that may contain
				// meta-data from other plugins that is only added on first
				// load. Therefore we trigger loading here.
				const moduleInfo = await this.load(resolution);
				// We need to make sure side effects in the original entry
				// point are respected even for
				// treeshake.moduleSideEffects: false. "moduleSideEffects"
				// is a writable property on ModuleInfo.
				moduleInfo.moduleSideEffects = true;
				// It is important that the new entry does not start with
				// \0 and has the same directory as the original one to not
				// mess up relative external import generation. Also
				// keeping the name and just adding a "?query" to the end
				// ensures that preserveModules will generate the original
				// entry name for this entry.
				return `${resolution.id}${PROXY_SUFFIX}`;
			}
			return null;
		},
		load(id) {
			if (id === POLYFILL_ID) {
				// Replace with actual polyfill
				return "console.log('polyfill');";
			}
			if (id.endsWith(PROXY_SUFFIX)) {
				const entryId = id.slice(0, -PROXY_SUFFIX.length);
				// We know ModuleInfo.hasDefaultExport is reliable because
				// we awaited this.load in resolveId
				const { hasDefaultExport } = this.getModuleInfo(entryId);
				let code =
					`import ${JSON.stringify(POLYFILL_ID)};` +
					`export * from ${JSON.stringify(entryId)};`;
				// Namespace reexports do not reexport default, so we need
				// special handling here
				if (hasDefaultExport) {
					code += `export { default } from ${JSON.stringify(entryId)};`;
				}
				return code;
			}
			return null;
		}
	};
}
```

`attributes` tells you which import attributes were present in the import. I.e. `import "foo" assert {type: "json"}` will pass along `attributes: {type: "json"}`.

Returning `null` defers to other `resolveId` functions and eventually the default resolution behavior. Returning `false` signals that `source` should be treated as an external module and not included in the bundle. If this happens for a relative import, the id will be renormalized the same way as when the `external` option is used.

If you return an object, then it is possible to resolve an import to a different id while excluding it from the bundle at the same time. This allows you to replace dependencies with external dependencies without the need for the user to mark them as "external" manually via the `external` option:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function externalizeDependencyPlugin() {
	return {
		name: 'externalize-dependency',
		resolveId(source) {
			if (source === 'my-dependency') {
				return { id: 'my-dependency-develop', external: true };
			}
			return null;
		}
	};
}
```

If `external` is `true`, then absolute ids will be converted to relative ids based on the user's choice for the [`makeAbsoluteExternalsRelative`](../configuration-options/index.md#makeabsoluteexternalsrelative) option. This choice can be overridden by passing either `external: "relative"` to always convert an absolute id to a relative id or `external: "absolute"` to keep it as an absolute id. When returning an object, relative external ids, i.e. ids starting with `./` or `../`, will _not_ be internally converted to an absolute id and converted back to a relative id in the output, but are instead included in the output unchanged. If you want relative ids to be renormalised and deduplicated instead, return an absolute file system location as `id` and choose `external: "relative"`.

If `false` is returned for `moduleSideEffects` in the first hook that resolves a module id and no other module imports anything from this module, then this module will not be included even if the module would have side effects. If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side effects (such as modifying a global or exported variable). If `"no-treeshake"` is returned, treeshaking will be turned off for this module and it will also be included in one of the generated chunks even if it is empty. If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the [`treeshake.moduleSideEffects`](../configuration-options/index.md#treeshake-modulesideeffects) option or default to `true`. The `load` and `transform` hooks can override this.

`resolvedBy` can be explicitly declared in the returned object. It will replace the corresponding field returned by [`this.resolve`](#this-resolve).

If you return a value for `attributes` for an external module, this will determine how imports of this module will be rendered when generating `"es"` output. E.g. `{id: "foo", external: true, attributes: {type: "json"}}` will cause imports of this module appear as `import "foo" assert {type: "json"}`. If you do not pass a value, the value of the `attributes` input parameter will be used. Pass an empty object to remove any attributes. While `attributes` do not influence rendering for bundled modules, they still need to be consistent across all imports of a module, otherwise a warning is emitted. The `load` and `transform` hooks can override this.

See [synthetic named exports](#synthetic-named-exports) for the effect of the `syntheticNamedExports` option. If `null` is returned or the flag is omitted, then `syntheticNamedExports` will default to `false`. The `load` and `transform` hooks can override this.

See [custom module meta-data](#custom-module-meta-data) for how to use the `meta` option. If `null` is returned or the option is omitted, then `meta` will default to an empty object. The `load` and `transform` hooks can add or replace properties of this object.

Note that while `resolveId` will be called for each import of a module and can therefore resolve to the same `id` many times, values for `external`, `attributes`, `meta`, `moduleSideEffects` or `syntheticNamedExports` can only be set once before the module is loaded. The reason is that after this call, Rollup will continue with the [`load`](#load) and [`transform`](#transform) hooks for that module that may override these values and should take precedence if they do so.

When triggering this hook from a plugin via [`this.resolve`](#this-resolve), it is possible to pass a custom options object to this hook. While this object will be passed unmodified, plugins should follow the convention of adding a `custom` property with an object where the keys correspond to the names of the plugins that the options are intended for. For details see [custom resolver options](#custom-resolver-options).

In watch mode or when using the cache explicitly, the resolved imports of a cached module are also taken from the cache and not determined via the `resolveId` hook again. To prevent this, you can return `true` from the [`shouldTransformCachedModule`](#shouldtransformcachedmodule) hook for that module. This will remove the module and its import resolutions from cache and call `transform` and `resolveId` again.

### shouldTransformCachedModule

|  |  |
| --: | :-- |
| Type: | `ShouldTransformCachedModuleHook` |
| Kind: | async, first |
| Previous: | [`load`](#load) where the cached file was loaded to compare its code with the cached version |
| Next: | [`moduleParsed`](#moduleparsed) if no plugin returns `true`, otherwise [`transform`](#transform) |

```typescript
type ShouldTransformCachedModuleHook = (options: {
	ast: AstNode;
	code: string;
	id: string;
	meta: { [plugin: string]: any };
	moduleSideEffects: boolean | 'no-treeshake';
	syntheticNamedExports: boolean | string;
}) => boolean | NullValue;
```

If the Rollup cache is used (e.g. in watch mode or explicitly via the JavaScript API), Rollup will skip the [`transform`](#transform) hook of a module if after the [`load`](#transform) hook, the loaded `code` is identical to the code of the cached copy. To prevent this, discard the cached copy and instead transform a module, plugins can implement this hook and return `true`.

This hook can also be used to find out which modules were cached and access their cached meta information.

If a plugin does not return a boolean, Rollup will trigger this hook for other plugins, otherwise all remaining plugins will be skipped.

### transform

|  |  |
| --: | :-- |
| Type: | `(code: string, id: string) => TransformResult` |
| Kind: | async, sequential |
| Previous: | [`load`](#load) where the currently handled file was loaded. If caching is used and there was a cached copy of that module, [`shouldTransformCachedModule`](#shouldtransformcachedmodule) if a plugin returned `true` for that hook |
| Next: | [`moduleParsed`](#moduleparsed) once the file has been processed and parsed |

```typescript
type TransformResult = string | null | Partial<SourceDescription>;

interface SourceDescription {
	code: string;
	map?: string | SourceMap;
	ast?: ESTree.Program;
	attributes?: { [key: string]: string } | null;
	meta?: { [plugin: string]: any } | null;
	moduleSideEffects?: boolean | 'no-treeshake' | null;
	syntheticNamedExports?: boolean | string | null;
}
```

Can be used to transform individual modules. To prevent additional parsing overhead in case e.g. this hook already used [`this.parse`](#this-parse) to generate an AST for some reason, this hook can optionally return a `{ code, ast, map }` object. The `ast` must be a standard ESTree AST with `start` and `end` properties for each node. If the transformation does not move code, you can preserve existing sourcemaps by setting `map` to `null`. Otherwise, you might need to generate the source map. See [the section on source code transformations](#source-code-transformations).

Note that in watch mode or when using the cache explicitly, the result of this hook is cached when rebuilding and the hook is only triggered again for a module `id` if either the `code` of the module has changed or a file has changed that was added via `this.addWatchFile` or `this.emitFile` the last time the hook was triggered for this module.

In all other cases, the [`shouldTransformCachedModule`](#shouldtransformcachedmodule) hook is triggered instead, which gives access to the cached module. Returning `true` from `shouldTransformCachedModule` will remove the module from cache and instead call `transform` again.

You can also use the object form of the return value to configure additional properties of the module. Note that it's possible to return only properties and no code transformations.

If `false` is returned for `moduleSideEffects` and no other module imports anything from this module, then this module will not be included even if the module would have side effects.

If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side effects (such as modifying a global or exported variable).

If `"no-treeshake"` is returned, treeshaking will be turned off for this module and it will also be included in one of the generated chunks even if it is empty.

If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the `load` hook that loaded this module, the first `resolveId` hook that resolved this module, the [`treeshake.moduleSideEffects`](../configuration-options/index.md#treeshake-modulesideeffects) option, or eventually default to `true`.

`attributes` contain the import attributes that were used when this module was imported. At the moment, they do not influence rendering for bundled modules but rather serve documentation purposes. If `null` is returned or the flag is omitted, then `attributes` will be determined by the `load` hook that loaded this module, the first `resolveId` hook that resolved this module, or the attributes present in the first import of this module.

See [synthetic named exports](#synthetic-named-exports) for the effect of the `syntheticNamedExports` option. If `null` is returned or the flag is omitted, then `syntheticNamedExports` will be determined by the `load` hook that loaded this module, the first `resolveId` hook that resolved this module, the [`treeshake.moduleSideEffects`](../configuration-options/index.md#treeshake-modulesideeffects) option, or eventually default to `false`.

See [custom module meta-data](#custom-module-meta-data) for how to use the `meta` option. If `null` is returned or the option is omitted, then `meta` will be determined by the `load` hook that loaded this module, the first `resolveId` hook that resolved this module or eventually default to an empty object.

You can use [`this.getModuleInfo`](#this-getmoduleinfo) to find out the previous values of `attributes`, `meta`, `moduleSideEffects` and `syntheticNamedExports` inside this hook.

### watchChange

|  |  |
| --: | :-- |
| Type: | `watchChange: (id: string, change: {event: 'create' \| 'update' \| 'delete'}) => void` |
| Kind: | async, parallel |
| Previous/Next: | This hook can be triggered at any time both during the build and the output generation phases. If that is the case, the current build will still proceed but a new build will be scheduled to start once the current build has completed, starting again with [`options`](#options) |

Notifies a plugin whenever Rollup has detected a change to a monitored file in `--watch` mode. If a build is currently running, this hook is called once the build finished. It will be called once for every file that changed. If a Promise is returned, Rollup will wait for the Promise to resolve before scheduling another build. This hook cannot be used by output plugins. The second argument contains additional details of the change event. If you need to be notified immediately when a file changed, you can use the [`watch.onInvalidate`](../configuration-options/index.md#watch-oninvalidate) configuration option.

## Output Generation Hooks

Output generation hooks can provide information about a generated bundle and modify a build once complete. They work the same way and have the same types as [Build Hooks](#build-hooks) but are called separately for each call to `bundle.generate(outputOptions)` or `bundle.write(outputOptions)`. Plugins that only use output generation hooks can also be passed in via the output options and therefore run only for certain outputs.

The first hook of the output generation phase is [`outputOptions`](#outputoptions), the last one is either [`generateBundle`](#generatebundle) if the output was successfully generated via `bundle.generate(...)`, [`writeBundle`](#writebundle) if the output was successfully generated via `bundle.write(...)`, or [`renderError`](#rendererror) if an error occurred at any time during the output generation.

<div class="legend-grid">
	<div style="grid-column: 1; grid-row: 1">
		<span class="legend-rect" style="background: #ffb3b3"></span>parallel
	</div>
	<div style="grid-column: 1; grid-row: 2">
		<span class="legend-rect" style="background: #ffd2b3"></span>sequential
	</div>
	<div style="grid-column: 1; grid-row: 3">
		<span class="legend-rect" style="background: #fff2b3"></span>first
	</div>
	<div style="grid-column: 2; grid-row: 1">
		<span class="legend-rect" style="border-color: #000"></span>async
	</div>
	<div style="grid-column: 2; grid-row: 2">
		<span class="legend-rect" style="border-color: #f00"></span>sync
	</div>
</div>

```mermaid
flowchart TB
    classDef default fill:transparent, color:#000;
    classDef hook-parallel fill:#ffb3b3,stroke:#000;
    classDef hook-sequential fill:#ffd2b3,stroke:#000;
    classDef hook-first fill:#fff2b3,stroke:#000;
    classDef hook-sequential-sync fill:#ffd2b3,stroke:#f00;
    classDef hook-first-sync fill:#fff2b3,stroke:#f00;

    augmentchunkhash("augmentChunkHash"):::hook-sequential-sync
    click augmentchunkhash "#augmentchunkhash" _parent

	banner("banner"):::hook-sequential
	click banner "#banner" _parent

	closebundle("closeBundle"):::hook-parallel
	click closebundle "#closebundle" _parent

	footer("footer"):::hook-sequential
	click footer "#footer" _parent

	generatebundle("generateBundle"):::hook-sequential
	click generatebundle "#generatebundle" _parent

	intro("intro"):::hook-sequential
	click intro "#intro" _parent

	outputoptions("outputOptions"):::hook-sequential-sync
	click outputoptions "#outputoptions" _parent

	outro("outro"):::hook-sequential
	click outro "#outro" _parent

	renderchunk("renderChunk"):::hook-sequential
	click renderchunk "#renderchunk" _parent

	renderdynamicimport("renderDynamicImport"):::hook-first-sync
	click renderdynamicimport "#renderdynamicimport" _parent

	rendererror("renderError"):::hook-parallel
	click rendererror "#rendererror" _parent

	renderstart("renderStart"):::hook-parallel
	click renderstart "#renderstart" _parent

	resolvefileurl("resolveFileUrl"):::hook-first-sync
	click resolvefileurl "#resolvefileurl" _parent

	resolveimportmeta("resolveImportMeta"):::hook-first-sync
	click resolveimportmeta "#resolveimportmeta" _parent

	writebundle("writeBundle"):::hook-parallel
	click writebundle "#writebundle" _parent


	outputoptions
	--> renderstart
	--> |each chunk|beforerenderdynamicimport

	afteraddons
	--> |each chunk|renderchunk

	augmentchunkhash
	--> generatebundle
	--> writebundle
	.-> closebundle

	subgraph generateChunks [" "]
	    direction TB
	    beforerenderdynamicimport(( ))
        ---> beforeresolveimportmeta(( ))
        ----> beforereaddons(( ))
        --> banner & footer & intro & outro
        --> afteraddons(( ))
        .-> |next chunk|beforerenderdynamicimport

	    beforerenderdynamicimport
        --> |"each import()"|renderdynamicimport
        --> beforerenderdynamicimport

    	beforeresolveimportmeta
    	--> |each import.meta.*|beforeimportmeta(( ))
    	--> |import.meta.url|resolvefileurl
    	--> afterresolveimportmeta(( ))

	    beforeimportmeta
	    --> |other|resolveimportmeta
	    --> afterresolveimportmeta

	    afterresolveimportmeta
	    --> beforeresolveimportmeta
	end

	renderchunk
    --> augmentchunkhash
    .-> |next chunk|renderchunk

	style generateChunks stroke-width:0px;

	rendererror
	.-> closebundle
```

Additionally, [`closeBundle`](#closebundle) can be called as the very last hook, but it is the responsibility of the User to manually call [`bundle.close()`](../javascript-api/index.md#rollup-rollup) to trigger this. The CLI will always make sure this is the case.

### augmentChunkHash

|  |  |
| --: | :-- |
| Type: | `(chunkInfo: RenderedChunk) => string` |
| Kind: | sync, sequential |
| Previous: | [`renderChunk`](#renderchunk) |
| Next: | [`renderChunk`](#renderchunk) if there are other chunks that still need to be processed, otherwise [`generateBundle`](#generatebundle) |

See the [`renderChunk`](../plugin-development/index.md#renderchunk) hook for the `RenderedChunk` type.

Can be used to augment the hash of individual chunks. Called for each Rollup output chunk. Returning a falsy value will not modify the hash. Truthy values will be passed to [`hash.update`](https://nodejs.org/dist/latest-v12.x/docs/api/crypto.html#crypto_hash_update_data_inputencoding). The `RenderedChunk` type is a reduced version of the `OutputChunk` type in [`generateBundle`](#generatebundle) without `code` and `map` and using placeholders for hashes in file names.

The following plugin will invalidate the hash of chunk `foo` with the current timestamp:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function augmentWithDatePlugin() {
	return {
		name: 'augment-with-date',
		augmentChunkHash(chunkInfo) {
			if (chunkInfo.name === 'foo') {
				return Date.now().toString();
			}
		}
	};
}
```

### banner

|  |  |
| --: | :-- |
| Type: | `string \| ((chunk: RenderedChunk) => string)` |
| Kind: | async, sequential |
| Previous: | [`resolveFileUrl`](#resolvefileurl) for each use of `import.meta.ROLLUP_FILE_URL_referenceId` and [`resolveImportMeta`](#resolveimportmeta) for all other accesses to `import.meta` in the current chunk |
| Next: | [`renderDynamicImport`](#renderdynamicimport) for each dynamic import expression in the next chunk if there is another one, otherwise [`renderChunk`](#renderchunk) for the first chunk |

Cf. [`output.banner/output.footer`](../configuration-options/index.md#output-banner-output-footer).

### closeBundle

|  |  |
| --: | :-- |
| Type: | `closeBundle: (error?: Error) => Promise<void> \| void` |
| Kind: | async, parallel |
| Previous: | [`buildEnd`](#buildend) if there was a build error, otherwise when [`bundle.close()`](../javascript-api/index.md#rollup-rollup) is called, in which case this would be the last hook to be triggered |

Can be used to clean up any external service that may be running. Rollup's CLI will make sure this hook is called after each run, but it is the responsibility of users of the JavaScript API to manually call `bundle.close()` once they are done generating bundles. For that reason, any plugin relying on this feature should carefully mention this in its documentation.

If a plugin wants to retain resources across builds in watch mode, they can check for [`this.meta.watchMode`](#this-meta) in this hook and perform the necessary cleanup for watch mode in [`closeWatcher`](#closewatcher).

If an error occurs during build or the `buildEnd` hook, it is passed to this hook as first argument.

### footer

|  |  |
| --: | :-- |
| Type: | `string \| ((chunk: RenderedChunk) => string)` |
| Kind: | async, sequential |
| Previous: | [`resolveFileUrl`](#resolvefileurl) for each use of `import.meta.ROLLUP_FILE_URL_referenceId` and [`resolveImportMeta`](#resolveimportmeta) for all other accesses to `import.meta` in the current chunk |
| Next: | [`renderDynamicImport`](#renderdynamicimport) for each dynamic import expression in the next chunk if there is another one, otherwise [`renderChunk`](#renderchunk) for the first chunk |

Cf. [`output.banner/output.footer`](../configuration-options/index.md#output-banner-output-footer).

### generateBundle

|  |  |
| --: | :-- |
| Type: | `(options: OutputOptions, bundle: { [fileName: string]: OutputAsset \| OutputChunk }, isWrite: boolean) => void` |
| Kind: | async, sequential |
| Previous: | [`augmentChunkHash`](#augmentchunkhash) |
| Next: | [`writeBundle`](#writebundle) if the output was generated via `bundle.write(...)`, otherwise this is the last hook of the output generation phase and may again be followed by [`outputOptions`](#outputoptions) if another output is generated |

```typescript
interface OutputAsset {
	fileName: string;
	names: string[];
	needsCodeReference: boolean;
	originalFileNames: string[];
	source: string | Uint8Array;
	type: 'asset';
}

interface OutputChunk {
	code: string;
	dynamicImports: string[];
	exports: string[];
	facadeModuleId: string | null;
	fileName: string;
	implicitlyLoadedBefore: string[];
	imports: string[];
	importedBindings: { [imported: string]: string[] };
	isDynamicEntry: boolean;
	isEntry: boolean;
	isImplicitEntry: boolean;
	map: SourceMap | null;
	modules: {
		[id: string]: {
			renderedExports: string[];
			removedExports: string[];
			renderedLength: number;
			originalLength: number;
			code: string | null;
		};
	};
	moduleIds: string[];
	name: string;
	preliminaryFileName: string;
	referencedFiles: string[];
	sourcemapFileName: string | null;
	type: 'chunk';
}
```

Called at the end of `bundle.generate()` or immediately before the files are written in `bundle.write()`. To modify the files after they have been written, use the [`writeBundle`](#writebundle) hook. `bundle` provides the full list of files being written or generated along with their details.

You can prevent files from being emitted by deleting them from the bundle object in this hook. To emit additional files, use the [`this.emitFile`](#this-emitfile) plugin context function.

::: danger

Do not directly add assets to the bundle. This circumvents internal mechanisms that Rollup has for tracking assets. It can also cause your asset to miss vital properties that Rollup relies on internally and your plugin can break with minor Rollup releases.

Instead, always use [`this.emitFile`](#this-emitfile).

:::

### intro

|  |  |
| --: | :-- |
| Type: | `string \| ((chunk: RenderedChunk) => string)` |
| Kind: | async, sequential |
| Previous: | [`resolveFileUrl`](#resolvefileurl) for each use of `import.meta.ROLLUP_FILE_URL_referenceId` and [`resolveImportMeta`](#resolveimportmeta) for all other accesses to `import.meta` in the current chunk |
| Next: | [`renderDynamicImport`](#renderdynamicimport) for each dynamic import expression in the next chunk if there is another one, otherwise [`renderChunk`](#renderchunk) for the first chunk |

Cf. [`output.intro/output.outro`](../configuration-options/index.md#output-intro-output-outro).

### outputOptions

|  |  |
| --: | :-- |
| Type: | `(outputOptions: OutputOptions) => OutputOptions \| null` |
| Kind: | sync, sequential |
| Previous: | [`buildEnd`](#buildend) if this is the first time an output is generated, otherwise either [`generateBundle`](#generatebundle), [`writeBundle`](#writebundle) or [`renderError`](#rendererror) depending on the previously generated output. This is the first hook of the output generation phase |
| Next: | [`renderStart`](#renderstart) |

Replaces or manipulates the output options object passed to `bundle.generate()` or `bundle.write()`. Returning `null` does not replace anything. If you just need to read the output options, it is recommended to use the [`renderStart`](#renderstart) hook as this hook has access to the output options after the transformations from all `outputOptions` hooks have been taken into account.

### outro

|  |  |
| --: | :-- |
| Type: | `string \| ((chunk: RenderedChunk) => string)` |
| Kind: | async, sequential |
| Previous: | [`resolveFileUrl`](#resolvefileurl) for each use of `import.meta.ROLLUP_FILE_URL_referenceId` and [`resolveImportMeta`](#resolveimportmeta) for all other accesses to `import.meta` in the current chunk |
| Next: | [`renderDynamicImport`](#renderdynamicimport) for each dynamic import expression in the next chunk if there is another one, otherwise [`renderChunk`](#renderchunk) for the first chunk |

Cf. [`output.intro/output.outro`](../configuration-options/index.md#output-intro-output-outro).

### renderChunk

|  |  |
| --: | :-- |
| Type: | `RenderChunkHook` |
| Kind: | async, sequential |
| Previous: | [`banner`](#banner), [`footer`](#footer), [`intro`](#intro), [`outro`](#outro) of the last chunk |
| Next: | [`augmentChunkHash`](#augmentchunkhash) |

```typescript
type RenderChunkHook = (
	code: string,
	chunk: RenderedChunk,
	options: NormalizedOutputOptions,
	meta: { chunks: Record<string, RenderedChunk> }
) => { code: string; map?: SourceMapInput } | string | null;

interface RenderedChunk {
	dynamicImports: string[];
	exports: string[];
	facadeModuleId: string | null;
	fileName: string;
	implicitlyLoadedBefore: string[];
	importedBindings: {
		[imported: string]: string[];
	};
	imports: string[];
	isDynamicEntry: boolean;
	isEntry: boolean;
	isImplicitEntry: boolean;
	moduleIds: string[];
	modules: {
		[id: string]: RenderedModule;
	};
	name: string;
	referencedFiles: string[];
	type: 'chunk';
}
```

Can be used to transform individual chunks. Called for each Rollup output chunk file. Returning `null` will apply no transformations. If you change code in this hook and want to support source maps, you need to return a `map` describing your changes, see [the section on source code transformations](#source-code-transformations).

`chunk` contains additional information about the chunk using the same `OutputChunk` type as the [`generateBundle`](#generatebundle) hook with the following differences:

- `code` and `map` are not set. Instead, use the `code` parameter of this hook.
- all referenced chunk file names that would contain hashes will contain hash placeholders instead. This includes `fileName`, `imports`, `importedBindings`, `dynamicImports` and `implicitlyLoadedBefore`. When you use such a placeholder file name or part of it in the code returned from this hook, Rollup will replace the placeholder with the actual hash before `generateBundle`, making sure the hash reflects the actual content of the final generated chunk including all referenced file hashes.

`chunk` is mutable and changes applied in this hook will propagate to other plugins and to the generated bundle. That means if you add or remove imports or exports in this hook, you should update `imports`, `importedBindings` and/or `exports`.

`meta.chunks` contains information about all the chunks Rollup is generating and gives you access to their `RenderedChunk` information, again using placeholders for hashes. That means you can explore the entire chunk graph in this hook.

### renderDynamicImport

|  |  |
| --: | :-- |
| Type: | `renderDynamicImportHook` |
| Kind: | sync, first |
| Previous: | [`renderStart`](#renderstart) if this is the first chunk, otherwise [`banner`](#banner), [`footer`](#footer), [`intro`](#intro), [`outro`](#outro) of the previous chunk |
| Next: | [`resolveFileUrl`](#resolvefileurl) for each use of `import.meta.ROLLUP_FILE_URL_referenceId` and [`resolveImportMeta`](#resolveimportmeta) for all other accesses to `import.meta` in the current chunk |

```typescript
type renderDynamicImportHook = (options: {
	customResolution: string | null;
	format: string;
	moduleId: string;
	targetModuleId: string | null;
	chunk: PreRenderedChunkWithFileName;
	targetChunk: PreRenderedChunkWithFileName;
	getTargetChunkImports: () => DynamicImportTargetChunk[] | null;
}) => { left: string; right: string } | null;

type PreRenderedChunkWithFileName = PreRenderedChunk & { fileName: string };

type DynamicImportTargetChunk =
	| ImportedInternalChunk
	| ImportedExternalChunk;

interface ImportedInternalChunk {
	type: 'internal';
	fileName: string;
	resolvedImportPath: string;
	chunk: PreRenderedChunk;
}

interface ImportedExternalChunk {
	type: 'external';
	fileName: string;
	resolvedImportPath: string;
}
```

See the [`chunkFileNames`](../configuration-options/index.md#output-chunkfilenames) option for the `PreRenderedChunk` type.

This hook provides fine-grained control over how dynamic imports are rendered by providing replacements for the code to the left (`import(`) and right (`)`) of the argument of the import expression. Returning `null` defers to other hooks of this type and ultimately renders a format-specific default.

`format` is the rendered output format, `moduleId` the id of the module performing the dynamic import. If the import could be resolved to an internal or external id, then `targetModuleId` will be set to this id, otherwise it will be `null`. If the dynamic import contained a non-string expression that was resolved by a [`resolveDynamicImport`](#resolvedynamicimport) hook to a replacement string, then `customResolution` will contain that string. `chunk` and `targetChunk` provide additional information about the chunk performing the import and the chunk being imported (the target chunk), respectively. `getTargetChunkImports` returns an array containing chunks which are imported by the target chunk. If the target chunk is unresolved or external, `targetChunk` will be null and `getTargetChunkImports` will return null.

The `PreRenderedChunkWithFileName` type is identical to the `PreRenderedChunk` type except for the addition of the `fileName` field, which contains the path and file name of the chunk. `fileName` may contain a placeholder if the chunk file name format contains a hash.

The following code will replace all dynamic imports with a custom handler, adding `import.meta.url` as a second argument to allow the handler to resolve relative imports correctly:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function dynamicImportPolyfillPlugin() {
	return {
		name: 'dynamic-import-polyfill',
		renderDynamicImport() {
			return {
				left: 'dynamicImportPolyfill(',
				right: ', import.meta.url)'
			};
		}
	};
}

// input
import('./lib.js');

// output
dynamicImportPolyfill('./lib.js', import.meta.url);
```

The next plugin will make sure all dynamic imports of `esm-lib` are marked as external and retained as import expressions to e.g. allow a CommonJS build to import an ES module in Node 13+, cf. how to [import ES modules from CommonJS](https://nodejs.org/api/esm.html#esm_import_expressions) in the Node documentation.

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function retainImportExpressionPlugin() {
	return {
		name: 'retain-import-expression',
		resolveDynamicImport(specifier) {
			if (specifier === 'esm-lib') return false;
			return null;
		},
		renderDynamicImport({ targetModuleId }) {
			if (targetModuleId === 'esm-lib') {
				return {
					left: 'import(',
					right: ')'
				};
			}
		}
	};
}
```

When a dynamic import occurs, the browser will fetch the requested module and parse it. If the target module is discovered to have imports and they have not already been fetched, the browser must perform more network requests before it can execute the module. This will incur the latency of an additional network round trip. For static modules, Rollup will hoist transitive dependencies ([`hoistTransitiveDependencies`](../configuration-options/index.md#output-hoisttransitiveimports)) to prevent this from occuring. However, dependency hoisting is currently not automatically performed for dynamic imports.

The following plugin can achieve similar preloading behavior for dynamic imports:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function dynamicImportDependencyPreloader() {
	return {
		name: 'dynamic-import-dependency-preloader',
		renderDynamicImport({ getTargetChunkImports }) {
			const transitiveImports = getTargetChunkImports();
			if (transitiveImports && transitiveImports.length > 0) {
				const preload = getTargetChunkImports()
					.map(
						chunk => `\t/* preload */ import(${chunk.resolvedImportPath})`
					)
					.join(',\n');
				return {
					left: `(\n${preload},\n\timport(`,
					right: `)\n)`
				};
			} else {
				return null;
			}
		}
	};
}
```

<!-- prettier-ignore-start -->
```js
// input
import('./lib.js');

// output
(
	/* preload */ import('./dependency-1.js'),
	/* preload */ import('./dependency-2.js'),
	import('./lib.js');
);
```
<!-- prettier-ignore-end -->

Note that when this hook rewrites dynamic imports in non-ES formats, no interop code to make sure that e.g. the default export is available as `.default` is generated. It is the responsibility of the plugin to make sure the rewritten dynamic import returns a Promise that resolves to a proper namespace object.

### renderError

|  |  |
| --: | :-- |
| Type: | `(error: Error) => void` |
| Kind: | async, parallel |
| Previous: | Any hook from [`renderStart`](#renderstart) to [`renderChunk`](#renderchunk) |
| Next: | If it is called, this is the last hook of the output generation phase and may again be followed by [`outputOptions`](#outputoptions) if another output is generated |

Called when Rollup encounters an error during `bundle.generate()` or `bundle.write()`. The error is passed to this hook. To get notified when generation completes successfully, use the `generateBundle` hook.

### renderStart

|  |  |
| --: | :-- |
| Type: | `(outputOptions: OutputOptions, inputOptions: InputOptions) => void` |
| Kind: | async, parallel |
| Previous: | [`outputOptions`](#outputoptions) |
| Next: | [`renderDynamicImport`](#renderdynamicimport) for each dynamic import expression in the first chunk |

Called initially each time `bundle.generate()` or `bundle.write()` is called. To get notified when generation has completed, use the `generateBundle` and `renderError` hooks. This is the recommended hook to use when you need access to the output options passed to `bundle.generate()` or `bundle.write()` as it takes the transformations by all [`outputOptions`](#outputoptions) hooks into account and also contains the right default values for unset options. It also receives the input options passed to `rollup.rollup()` so that plugins that can be used as output plugins, i.e. plugins that only use `generate` phase hooks, can get access to them.

### resolveFileUrl

|  |  |
| --: | :-- |
| Type: | `ResolveFileUrlHook` |
| Kind: | sync, first |
| Previous: | [`renderDynamicImport`](#renderdynamicimport) for each dynamic import expression in the current chunk |
| Next: | [`banner`](#banner), [`footer`](#footer), [`intro`](#intro), [`outro`](#outro) in parallel for the current chunk |

```typescript
type ResolveFileUrlHook = (options: {
	chunkId: string;
	fileName: string;
	format: InternalModuleFormat;
	moduleId: string;
	referenceId: string;
	relativePath: string;
}) => string | NullValue;
```

Allows to customize how Rollup resolves URLs of files that were emitted by plugins via `this.emitFile`. By default, Rollup will generate code for `import.meta.ROLLUP_FILE_URL_referenceId` that should correctly generate absolute URLs of emitted files independent of the output format and the host system where the code is deployed.

For that, all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available. In case that fails or to generate more optimized code, this hook can be used to customize this behaviour. To do that, the following information is available:

- `chunkId`: The id of the chunk this file is referenced from. If the chunk file name would contain a hash, this id will contain a placeholder instead. Rollup will replace this placeholder with the actual file name if it ends up in the generated code.
- `fileName`: The path and file name of the emitted file, relative to `output.dir` without a leading `./`. Again if this is a chunk that would have a hash in its name, it will contain a placeholder instead.
- `format`: The rendered output format.
- `moduleId`: The id of the original module this file is referenced from. Useful for conditionally resolving certain assets differently.
- `referenceId`: The reference id of the file.
- `relativePath`: The path and file name of the emitted file, relative to the chunk the file is referenced from. This will path will contain no leading `./` but may contain a leading `../`.

The following plugin will always resolve all files relative to the current document:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function resolveToDocumentPlugin() {
	return {
		name: 'resolve-to-document',
		resolveFileUrl({ fileName }) {
			return `new URL('${fileName}', document.baseURI).href`;
		}
	};
}
```

### resolveImportMeta

|  |  |
| --: | :-- |
| Type: | `(property: string \| null, {chunkId: string, moduleId: string, format: string}) => string \| null` |
| Kind: | sync, first |
| Previous: | [`renderDynamicImport`](#renderdynamicimport) for each dynamic import expression in the current chunk |
| Next: | [`banner`](#banner), [`footer`](#footer), [`intro`](#intro), [`outro`](#outro) in parallel for the current chunk |

Allows to customize how Rollup handles `import.meta` and `import.meta.someProperty`, in particular `import.meta.url`. In ES modules, `import.meta` is an object and `import.meta.url` contains the URL of the current module, e.g. `http://server.net/bundle.js` for browsers or `file:///path/to/bundle.js` in Node.

By default, for formats other than ES modules, Rollup replaces `import.meta.url` with code that attempts to match this behaviour by returning the dynamic URL of the current chunk. Note that all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available. For other properties, `import.meta.someProperty` is replaced with `undefined` while `import.meta` is replaced with an object containing a `url` property.

This behaviour can be changed—also for ES modules—via this hook. For each occurrence of `import.meta<.someProperty>`, this hook is called with the name of the property or `null` if `import.meta` is accessed directly. For example, the following code will resolve `import.meta.url` using the relative path of the original module to the current working directory and again resolve this path against the base URL of the current document at runtime:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function importMetaUrlCurrentModulePlugin() {
	return {
		name: 'import-meta-url-current-module',
		resolveImportMeta(property, { moduleId }) {
			if (property === 'url') {
				return `new URL('${path.relative(
					process.cwd(),
					moduleId
				)}', document.baseURI).href`;
			}
			return null;
		}
	};
}
```

If the `chunkId` would contain a hash, it will contain a placeholder instead. If this placeholder ends up in the generated code, Rollup will replace it with the actual chunk hash.

### writeBundle

|  |  |
| --: | :-- |
| Type: | `(options: OutputOptions, bundle: { [fileName: string]: OutputAsset \| OutputChunk }) => void` |
| Kind: | async, parallel |
| Previous: | [`generateBundle`](#generatebundle) |
| Next: | If it is called, this is the last hook of the output generation phase and may again be followed by [`outputOptions`](#outputoptions) if another output is generated |

Called only at the end of `bundle.write()` once all files have been written. Similar to the [`generateBundle`](#generatebundle) hook, `bundle` provides the full list of files being written along with their details.

## Plugin Context

A number of utility functions and informational bits can be accessed from within most [hooks](#build-hooks) via `this`:

### this.addWatchFile

|       |                        |
| ----: | :--------------------- |
| Type: | `(id: string) => void` |

Adds additional files to be monitored in watch mode so that changes to these files will trigger rebuilds. `id` can be an absolute path to a file or directory or a path relative to the current working directory. This context function can be used in all plugin hooks except `closeBundle`. However, it will not have an effect when used in [output generation hooks](#output-generation-hooks) if [`watch.skipWrite`](../configuration-options/index.md#watch-skipwrite) is set to `true`.

Note that when emitting assets that correspond to an existing file, it is recommended to set the `originalFileName` property in the [`this.emitFile`](#this-emitfile) call instead as that will not only watch the file but also make the connection transparent to other plugins.

**Note:** Usually in watch mode to improve rebuild speed, the `transform` hook will only be triggered for a given module if its contents actually changed. Using `this.addWatchFile` from within the `transform` hook will make sure the `transform` hook is also reevaluated for this module if the watched file changes.

In general, it is recommended to use `this.addWatchFile` from within the hook that depends on the watched file.

### this.debug

|  |  |
| --: | :-- |
| Type: | `(log: string \| RollupLog \| (() => RollupLog \| string), position?: number \| { column: number; line: number }) => void` |

Generate a `"debug"` log. See [`this.warn`](#this-warn) for details. Debug logs always get `code: "PLUGIN_LOG"` added by Rollup. Make sure to add a distinctive `pluginCode` to those logs for easy filtering.

These logs are only processed if the [`logLevel`](../configuration-options/index.md#loglevel) option is explicitly set to `"debug"`, otherwise it does nothing. Therefore, it is encouraged to add helpful debug logs to plugins as that can help spot issues while they will be efficiently muted by default. If you need to do expensive computations to generate the log, make sure to use the function form so that these computations are only performed if the log is actually processed.

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function plugin() {
	return {
		name: 'test',
		transform(code, id) {
			this.debug(
				() =>
					`transforming ${id},\n` +
					`module contains, ${code.split('\n').length} lines`
			);
		}
	};
}
```

### this.emitFile

|  |  |
| --: | :-- |
| Type: | `(emittedFile: EmittedChunk \| EmittedPrebuiltChunk \| EmittedAsset) => string` |

```typescript
interface EmittedChunk {
	type: 'chunk';
	id: string;
	name?: string;
	fileName?: string;
	implicitlyLoadedAfterOneOf?: string[];
	importer?: string;
	preserveSignature?: 'strict' | 'allow-extension' | 'exports-only' | false;
}

interface EmittedPrebuiltChunk {
	type: 'prebuilt-chunk';
	fileName: string;
	code: string;
	exports?: string[];
	map?: SourceMap;
}

interface EmittedAsset {
	type: 'asset';
	name?: string;
	needsCodeReference?: boolean;
	originalFileName?: string;
	fileName?: string;
	source?: string | Uint8Array;
}
```

Emits a new file that is included in the build output and returns a `referenceId` that can be used in various places to reference the emitted file. You can emit chunks, prebuilt chunks or assets.

When emitting chunks or assets, either a `name` or a `fileName` can be supplied. If a `fileName` is provided, it will be used unmodified as the name of the generated file, throwing an error if this causes a conflict. Otherwise, if a `name` is supplied, this will be used as substitution for `[name]` in the corresponding [`output.chunkFileNames`](../configuration-options/index.md#output-chunkfilenames) or [`output.assetFileNames`](../configuration-options/index.md#output-assetfilenames) pattern, possibly adding a unique number to the end of the file name to avoid conflicts. If neither a `name` nor `fileName` is supplied, a default name will be used. Prebuilt chunks must always have a `fileName`.

You can reference the URL of an emitted file in any code returned by a [`load`](#load) or [`transform`](#transform) plugin hook via `import.meta.ROLLUP_FILE_URL_referenceId`. See [File URLs](#file-urls) for more details and an example.

The generated code that replaces `import.meta.ROLLUP_FILE_URL_referenceId` can be customized via the [`resolveFileUrl`](#resolvefileurl) plugin hook. You can also use [`this.getFileName(referenceId)`](#this-getfilename) to determine the file name as soon as it is available. If the file name is not set explicitly, then

- asset file names are available starting with the [`renderStart`](#renderstart) hook. For assets that are emitted later, the file name will be available immediately after emitting the asset.
- chunk file names that do not contain a hash are available as soon as chunks are created after the `renderStart` hook.
- if a chunk file name would contain a hash, using `getFileName` in any hook before [`generateBundle`](#generatebundle) will return a name containing a placeholder instead of the actual name. If you use this file name or parts of it in a chunk you transform in [`renderChunk`](#renderchunk), Rollup will replace the placeholder with the actual hash before `generateBundle`, making sure the hash reflects the actual content of the final generated chunk including all referenced file hashes.

If the `type` is _`chunk`_, then this emits a new chunk with the given module `id` as entry point. To resolve it, the `id` will be passed through build hooks just like regular entry points, starting with [`resolveId`](#resolveid). If an `importer` is provided, this acts as the second parameter of `resolveId` and is important to properly resolve relative paths. If it is not provided, paths will be resolved relative to the current working directory. If a value for `preserveSignature` is provided, this will override [`preserveEntrySignatures`](../configuration-options/index.md#preserveentrysignatures) for this particular chunk.

This will not result in duplicate modules in the graph, instead if necessary, existing chunks will be split or a facade chunk with reexports will be created. Chunks with a specified `fileName` will always generate separate chunks while other emitted chunks may be deduplicated with existing chunks even if the `name` does not match. If such a chunk is not deduplicated, the [`output.chunkFileNames`](../configuration-options/index.md#output-chunkfilenames) name pattern will be used.

By default, Rollup assumes that emitted chunks are executed independent of other entry points, possibly even before any other code is executed. This means that if an emitted chunk shares a dependency with an existing entry point, Rollup will create an additional chunk for dependencies that are shared between those entry points. Providing a non-empty array of module ids for `implicitlyLoadedAfterOneOf` will change that behaviour by giving Rollup additional information to prevent this in some cases. Those ids will be resolved the same way as the `id` property, respecting the `importer` property if it is provided. Rollup will now assume that the emitted chunk is only executed if at least one of the entry points that lead to one of the ids in `implicitlyLoadedAfterOneOf` being loaded has already been executed, creating the same chunks as if the newly emitted chunk was only reachable via dynamic import from the modules in `implicitlyLoadedAfterOneOf`. Here is an example that uses this to create a simple HTML file with several scripts, creating optimized chunks to respect their execution order:

<!-- prettier-ignore-start -->
```js twoslash
// rollup.config.js
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function generateHtmlPlugin() {
// ---cut-start---
	/** @type {string} */
// ---cut-end---
	let ref1;
// ---cut-start---
	/** @type {string} */
// ---cut-end---
	let ref2;
// ---cut-start---
	/** @type {string} */
// ---cut-end---
	let ref3;
	return {
		name: 'generate-html',
		buildStart() {
			ref1 = this.emitFile({
				type: 'chunk',
				id: 'src/entry1'
			});
			ref2 = this.emitFile({
				type: 'chunk',
				id: 'src/entry2',
				implicitlyLoadedAfterOneOf: ['src/entry1']
			});
			ref3 = this.emitFile({
				type: 'chunk',
				id: 'src/entry3',
				implicitlyLoadedAfterOneOf: ['src/entry2']
			});
		},
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'index.html',
				source: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Title</title>
         </head>
        <body>
          <script src="${this.getFileName(ref1)}" type="module"></script>
          <script src="${this.getFileName(ref2)}" type="module"></script>
          <script src="${this.getFileName(ref3)}" type="module"></script>
        </body>
        </html>`
			});
		}
	};
}

// ---cut-start---
/** @returns {import('rollup').RollupOptions} */
// ---cut-end---
export default {
	input: [],
	preserveEntrySignatures: false,
	plugins: [generateHtmlPlugin()],
	output: {
		format: 'es',
		dir: 'dist'
	}
};
```
<!-- prettier-ignore-end -->

If there are no dynamic imports, this will create exactly three chunks where the first chunk contains all dependencies of `src/entry1`, the second chunk contains only the dependencies of `src/entry2` that are not contained in the first chunk, importing those from the first chunk, and again the same for the third chunk.

Note that even though any module id can be used in `implicitlyLoadedAfterOneOf`, Rollup will throw an error if such an id cannot be uniquely associated with a chunk, e.g. because the `id` cannot be reached implicitly or explicitly from the existing static entry points, or because the file is completely tree-shaken. Using only entry points, either defined by the user or of previously emitted chunks, will always work, though.

If the `type` is `prebuilt-chunk`, it emits a chunk with fixed contents provided by the `code` parameter. At the moment, `fileName` is also required to provide the name of the chunk. If it exports some variables, we should list these via the optional `exports`. Via `map` we can provide a sourcemap that corresponds to `code`.

To reference a prebuilt chunk in imports, we need to mark the "module" as external in the [`resolveId`](#resolveid) hook as prebuilt chunks are not part of the module graph. Instead, they behave like assets with chunk meta-data:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function emitPrebuiltChunkPlugin() {
	return {
		name: 'emit-prebuilt-chunk',
		resolveId(source) {
			if (source === './my-prebuilt-chunk.js') {
				return {
					id: source,
					external: true
				};
			}
		},
		buildStart() {
			this.emitFile({
				type: 'prebuilt-chunk',
				fileName: 'my-prebuilt-chunk.js',
				code: 'export const foo = "foo"',
				exports: ['foo']
			});
		}
	};
}
```

Then you can reference the prebuilt chunk in your code:

```js
import { foo } from './my-prebuilt-chunk.js';
```

Currently, emitting a prebuilt chunk is a basic feature. Looking forward to your feedback.

If the `type` is _`asset`_, then this emits an arbitrary new file with the given `source` as content. It is possible to defer setting the `source` via [`this.setAssetSource(referenceId, source)`](#this-setassetsource) to a later time to be able to reference a file during the build phase while setting the source separately for each output during the generate phase. Assets with a specified `fileName` will always generate separate files while other emitted assets may be deduplicated with existing assets if they have the same source even if the `name` does not match. If an asset without a `fileName` is not deduplicated, the [`output.assetFileNames`](../configuration-options/index.md#output-assetfilenames) name pattern will be used.

If this asset corresponds to an actual file on disk, then `originalFileName` should be set to the absolute path of the file. In that case, this property will be passed on to subsequent plugin hooks that receive a `PreRenderedAsset` or an `OutputAsset` like [`generateBundle`](#generatebundle). In watch mode, Rollup will also automatically watch this file for changes and trigger a rebuild if it changes. Therefore, it is not necessary to call `this.addWatchFile` for this file.

If `needsCodeReference` is set to `true` and this asset is not referenced by any code in the output via `import.meta.ROLLUP_FILE_URL_referenceId`, then Rollup will not emit it. This also respects references removed via tree-shaking, i.e. if the corresponding `import.meta.ROLLUP_FILE_URL_referenceId` is part of the source code but is not actually used and the reference is removed by tree-shaking, then the asset is not emitted.

### this.error

|  |  |
| --: | :-- |
| Type: | `(error: string \| RollupLog \| Error, position?: number \| { column: number; line: number }) => never` |

Structurally equivalent to [`this.warn`](#this-warn), except that it will also abort the bundling process with an error. See the [`onLog`](../configuration-options/index.md#onlog) option for information about the `RollupLog` type.

If an Error instance is passed, it will be used as-is, otherwise a new Error instance will be created with the given error message and all additional provided properties.

In all hooks except the [`onLog`](#onlog) hook, the error will be augmented with `code: "PLUGIN_ERROR"` and `plugin: plugin.name`properties. If a`code`property already exists and the code does not start with`PLUGIN_`, it will be renamed to `pluginCode`.

In the [`onLog`](#onlog) hook, this function is an easy way to turn warnings into errors while keeping all additional properties of the warning:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function myPlugin() {
	return {
		name: 'my-plugin',
		onLog(level, log) {
			if (level === 'warn' && log.code === 'THIS_IS_NOT_OK') {
				return this.error(log);
			}
		}
	};
}
```

When used in the `transform` hook, the `id` of the current module will also be added and a `position` can be supplied. This is a character index or file location which will be used to augment the log with `pos`, `loc` (a standard `{ file, line, column }` object) and `frame` (a snippet of code showing the location).

### this.getCombinedSourcemap

|       |                   |
| ----: | :---------------- |
| Type: | `() => SourceMap` |

Get the combined source maps of all previous plugins. This context function can only be used in the [`transform`](#transform) plugin hook.

### this.getFileName

|       |                                   |
| ----: | :-------------------------------- |
| Type: | `(referenceId: string) => string` |

Get the file name of a chunk or asset that has been emitted via [`this.emitFile`](#this-emitfile). The file name will be relative to `outputOptions.dir`.

### this.getModuleIds

|       |                                  |
| ----: | :------------------------------- |
| Type: | `() => IterableIterator<string>` |

Returns an `Iterator` that gives access to all module ids in the current graph. It can be iterated via

```js
for (const moduleId of this.getModuleIds()) {
	/* ... */
}
```

or converted into an Array via `Array.from(this.getModuleIds())`.

### this.getModuleInfo

|       |                                              |
| ----: | :------------------------------------------- |
| Type: | `(moduleId: string) => (ModuleInfo \| null)` |

```typescript
interface ModuleInfo {
	id: string; // the id of the module, for convenience
	code: string | null; // the source code of the module, `null` if external or not yet available
	ast: ESTree.Program; // the parsed abstract syntax tree if available
	hasDefaultExport: boolean | null; // is there a default export, `null` if external or not yet available
	isEntry: boolean; // is this a user- or plugin-defined entry point
	isExternal: boolean; // for external modules that are referenced but not included in the graph
	isIncluded: boolean | null; // is the module included after tree-shaking, `null` if external or not yet available
	importedIds: string[]; // the module ids statically imported by this module
	importedIdResolutions: ResolvedId[]; // how statically imported ids were resolved, for use with this.load
	importers: string[]; // the ids of all modules that statically import this module
	exportedBindings: Record<string, string[]> | null; // contains all exported variables associated with the path of `from`, `null` if external
	exports: string[] | null; // all exported variables, `null` if external
	dynamicallyImportedIds: string[]; // the module ids imported by this module via dynamic import()
	dynamicallyImportedIdResolutions: ResolvedId[]; // how ids imported via dynamic import() were resolved
	dynamicImporters: string[]; // the ids of all modules that import this module via dynamic import()
	implicitlyLoadedAfterOneOf: string[]; // implicit relationships, declared via this.emitFile
	implicitlyLoadedBefore: string[]; // implicit relationships, declared via this.emitFile
	attributes: { [key: string]: string }; // import attributes for this module
	meta: { [plugin: string]: any }; // custom module meta-data
	moduleSideEffects: boolean | 'no-treeshake'; // are imports of this module included if nothing is imported from it
	syntheticNamedExports: boolean | string; // final value of synthetic named exports
}

interface ResolvedId {
	id: string; // the id of the imported module
	external: boolean | 'absolute'; // is this module external, "absolute" means it will not be rendered as relative in the module
	attributes: { [key: string]: string }; // import attributes for this import
	meta: { [plugin: string]: any }; // custom module meta-data when resolving the module
	moduleSideEffects: boolean | 'no-treeshake'; // are side effects of the module observed, is tree-shaking enabled
	resolvedBy: string; // which plugin resolved this module, "rollup" if resolved by Rollup itself
	syntheticNamedExports: boolean | string; // does the module allow importing non-existing named exports
}
```

Returns additional information about the module in question.

During the build, this object represents currently available information about the module which may be inaccurate before the [`buildEnd`](#buildend) hook:

- `id` and `isExternal` will never change.
- `code`, `ast`, `hasDefaultExport`, `exports` and `exportedBindings` are only available after parsing, i.e. in the [`moduleParsed`](#moduleparsed) hook or after awaiting [`this.load`](#this-load). At that point, they will no longer change.
- if `isEntry` is `true`, it will no longer change. It is however possible for modules to become entry points after they are parsed, either via [`this.emitFile`](#this-emitfile) or because a plugin inspects a potential entry point via [`this.load`](#this-load) in the [`resolveId`](#resolveid) hook when resolving an entry point. Therefore, it is not recommended relying on this flag in the [`transform`](#transform) hook. It will no longer change after `buildEnd`.
- Similarly, `implicitlyLoadedAfterOneOf` can receive additional entries at any time before `buildEnd` via [`this.emitFile`](#this-emitfile).
- `importers`, `dynamicImporters` and `implicitlyLoadedBefore` will start as empty arrays, which receive additional entries as new importers and implicit dependents are discovered. They will no longer change after `buildEnd`.
- `isIncluded` is only available after `buildEnd`, at which point it will no longer change.
- `importedIds`, `importedIdResolutions`, `dynamicallyImportedIds` and `dynamicallyImportedIdResolutions` are available when a module has been parsed and its dependencies have been resolved. This is the case in the `moduleParsed` hook or after awaiting [`this.load`](#this-load) with the `resolveDependencies` flag. At that point, they will no longer change.
- `attributes`, `meta`, `moduleSideEffects` and `syntheticNamedExports` can be changed by [`load`](#load) and [`transform`](#transform) hooks. Moreover, while most properties are read-only, these properties are writable and changes will be picked up if they occur before the `buildEnd` hook is triggered. `meta` itself should not be overwritten, but it is ok to mutate its properties at any time to store meta information about a module. The advantage of doing this instead of keeping state in a plugin is that `meta` is persisted to and restored from the cache if it is used, e.g. when using watch mode from the CLI.

Returns `null` if the module id cannot be found.

### this.getWatchFiles

|       |                  |
| ----: | :--------------- |
| Type: | `() => string[]` |

Get ids of the files which has been watched previously. Include both files added by plugins with `this.addWatchFile` and files added implicitly by Rollup during the build.

### this.info

|  |  |
| --: | :-- |
| Type: | `(log: string \| RollupLog \| (() => RollupLog \| string), position?: number \| { column: number; line: number }) => void` |

Generate an `"info"` log. See [`this.warn`](#this-warn) for details. Info logs always get `code: "PLUGIN_LOG"` added by Rollup. As these logs are displayed by default, use them for information that is not a warning but makes sense to display to all users on every build.

If the [`logLevel`](../configuration-options/index.md#loglevel) option is set to `"warn"` or `"silent"`, this method will do nothing.

### this.load

|       |        |
| ----: | :----- |
| Type: | `Load` |

```typescript
type Load = (options: {
	id: string;
	resolveDependencies?: boolean;
	attributes?: Record<string, string> | null;
	meta?: CustomPluginOptions | null;
	moduleSideEffects?: boolean | 'no-treeshake' | null;
	syntheticNamedExports?: boolean | string | null;
}) => Promise<ModuleInfo>;
```

Loads and parses the module corresponding to the given id, attaching additional meta information to the module if provided. This will trigger the same [`load`](#load), [`transform`](#transform) and [`moduleParsed`](#moduleparsed) hooks that would be triggered if the module were imported by another module.

This allows you to inspect the final content of modules before deciding how to resolve them in the [`resolveId`](#resolveid) hook and e.g. resolve to a proxy module instead. If the module becomes part of the graph later, there is no additional overhead from using this context function as the module will not be parsed again. The signature allows you to directly pass the return value of [`this.resolve`](#this-resolve) to this function as long as it is neither `null` nor external.

The returned Promise will resolve once the module has been fully transformed and parsed but before any imports have been resolved. That means that the resulting `ModuleInfo` will have empty `importedIds`, `dynamicallyImportedIds`, `importedIdResolutions` and `dynamicallyImportedIdResolutions`. This helps to avoid deadlock situations when awaiting `this.load` in a `resolveId` hook. If you are interested in `importedIds` and `dynamicallyImportedIds`, you can either implement a `moduleParsed` hook or pass the `resolveDependencies` flag, which will make the Promise returned by `this.load` wait until all dependency ids have been resolved.

Note that with regard to the `attributes`, `meta`, `moduleSideEffects` and `syntheticNamedExports` options, the same restrictions apply as for the `resolveId` hook: Their values only have an effect if the module has not been loaded yet. Thus, it is very important to use `this.resolve` first to find out if any plugins want to set special values for these options in their `resolveId` hook, and pass these options on to `this.load` if appropriate. The example below showcases how this can be handled to add a proxy module for modules containing a special code comment. Note the special handling for re-exporting the default export:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
export default function addProxyPlugin() {
	return {
		async resolveId(source, importer, options) {
			if (importer?.endsWith('?proxy')) {
				// Do not proxy ids used in proxies
				return null;
			}
			// We make sure to pass on any resolveId options to
			// this.resolve to get the module id
			const resolution = await this.resolve(source, importer, options);
			// We can only pre-load existing and non-external ids
			if (resolution && !resolution.external) {
				// we pass on the entire resolution information
				const moduleInfo = await this.load(resolution);
				if (moduleInfo.code.includes('/* use proxy */')) {
					return `${resolution.id}?proxy`;
				}
			}
			// As we already fully resolved the module, there is no reason
			// to resolve it again
			return resolution;
		},
		load(id) {
			if (id.endsWith('?proxy')) {
				const importee = id.slice(0, -'?proxy'.length);
				// Note that namespace reexports do not reexport default
				// exports
				let code = `console.log('proxy for ${importee}'); export * from ${JSON.stringify(
					importee
				)};`;
				// We know that while resolving the proxy, importee was
				// already fully loaded and parsed, so we can rely on
				// hasDefaultExport
				if (this.getModuleInfo(importee).hasDefaultExport) {
					code += `export { default } from ${JSON.stringify(importee)};`;
				}
				return code;
			}
			return null;
		}
	};
}
```

If the module was already loaded, `this.load` will just wait for the parsing to complete and then return its module information. If the module was not yet imported by another module, it will not automatically trigger loading other modules imported by this module. Instead, static and dynamic dependencies will only be loaded once this module has actually been imported at least once.

While it is safe to use `this.load` in a `resolveId` hook, you should be very careful when awaiting it in a `load` or `transform` hook. If there are cyclic dependencies in the module graph, this can easily lead to a deadlock, so any plugin needs to manually take care to avoid waiting for `this.load` inside the `load` or `transform` of the any module that is in a cycle with the loaded module.

Here is another, more elaborate example where we scan entire dependency sub-graphs via the `resolveDependencies` option and repeated calls to `this.load`. We use a `Set` of handled module ids to handle cyclic dependencies. The goal of the plugin is to add a log to each dynamically imported chunk that just lists all modules in the chunk. While this is just a toy example, the technique could be used to e.g. create a single style tag for all CSS imported in the sub-graph.

```js twoslash
// The leading \0 instructs other plugins not to try to resolve, load or
// transform our proxy modules
const DYNAMIC_IMPORT_PROXY_PREFIX = '\0dynamic-import:';

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
export default function dynamicChunkLogsPlugin() {
	return {
		name: 'dynamic-chunk-logs',
		async resolveDynamicImport(specifier, importer) {
			// Ignore non-static targets
			if (!(typeof specifier === 'string')) return;
			// Get the id and initial meta information of the import target
			const resolved = await this.resolve(specifier, importer);
			// Ignore external targets. Explicit externals have the
			// "external" property while unresolved imports are "null".
			if (resolved && !resolved.external) {
				// We trigger loading the module without waiting for it
				// here because meta information attached by resolveId
				// hooks, that may be contained in "resolved" and that
				// plugins like "commonjs" may depend upon, is only
				// attached to a module the first time it is loaded. This
				// ensures that this meta information is not lost when we
				// later use "this.load" again in the load hook with just
				// the module id.
				this.load(resolved);
				return `${DYNAMIC_IMPORT_PROXY_PREFIX}${resolved.id}`;
			}
		},
		async load(id) {
			// Ignore all files except our dynamic import proxies
			if (!id.startsWith('\0dynamic-import:')) return null;
			const actualId = id.slice(DYNAMIC_IMPORT_PROXY_PREFIX.length);
			// To allow loading modules in parallel while keeping
			// complexity low, we do not directly await each "this.load"
			// call but put their promises into an array where we await
			// them via an async for loop.
			const moduleInfoPromises = [
				this.load({ id: actualId, resolveDependencies: true })
			];
			// We track each loaded dependency here so that we do not load
			// a file twice and also do  not get stuck when there are
			// circular dependencies.
			const dependencies = new Set([actualId]);
			// "importedIdResolutions" tracks the objects created by
			// resolveId hooks. We are using those instead of "importedIds"
			// so that again, important meta information is not lost.
			for await (const { importedIdResolutions } of moduleInfoPromises) {
				for (const resolved of importedIdResolutions) {
					if (!dependencies.has(resolved.id)) {
						dependencies.add(resolved.id);
						moduleInfoPromises.push(
							this.load({ ...resolved, resolveDependencies: true })
						);
					}
				}
			}
			// We log all modules in a dynamic chunk when it is loaded.
			let code = `console.log([${[...dependencies]
				.map(JSON.stringify)
				.join(', ')}]); export * from ${JSON.stringify(actualId)};`;
			// Namespace reexports do not reexport default exports, which
			// is why we reexport it manually if it exists
			if (this.getModuleInfo(actualId).hasDefaultExport) {
				code += `export { default } from ${JSON.stringify(actualId)};`;
			}
			return code;
		}
	};
}
```

### this.meta

|       |                                               |
| ----: | :-------------------------------------------- |
| Type: | `{rollupVersion: string, watchMode: boolean}` |

An object containing potentially useful Rollup metadata:

- `rollupVersion`: The currently running version of Rollup as define in `package.json`.
- `watchMode`: `true` if Rollup was started via `rollup.watch(...)` or from the command line with `--watch`, `false` otherwise.

`meta` is the only context property accessible from the [`options`](#options) hook.

### this.parse

|       |                                                            |
| ----: | :--------------------------------------------------------- |
| Type: | `(code: string, options?: ParseOptions) => ESTree.Program` |

```typescript
interface ParseOptions {
	allowReturnOutsideFunction?: boolean;
}
```

Use Rollup's internal SWC-based parser to parse code to an [ESTree-compatible](https://github.com/estree/estree) AST.

- `allowReturnOutsideFunction`: When `true` this allows return statements to be outside functions to e.g. support parsing CommonJS code.

### this.resolve

|       |           |
| ----: | :-------- |
| Type: | `Resolve` |

```typescript
type Resolve = (
	source: string,
	importer?: string,
	options?: {
		skipSelf?: boolean;
		isEntry?: boolean;
		attributes?: { [key: string]: string };
		custom?: { [plugin: string]: any };
	}
) => ResolvedId;
```

::: tip

The return type **ResolvedId** of this hook is defined in [`this.getModuleInfo`](#this-getmoduleinfo).

:::

Resolve imports to module ids (i.e. file names) using the same plugins that Rollup uses, and determine if an import should be external. If `null` is returned, the import could not be resolved by Rollup or any plugin but was not explicitly marked as external by the user. If an absolute external id is returned that should remain absolute in the output either via the [`makeAbsoluteExternalsRelative`](../configuration-options/index.md#makeabsoluteexternalsrelative) option or by explicit plugin choice in the [`resolveId`](#resolveid) hook, `external` will be `"absolute"` instead of `true`.

The default of `skipSelf` is `true`, So the `resolveId` hook of the plugin from which `this.resolve` is called will be skipped when resolving. When other plugins themselves also call `this.resolve` in their `resolveId` hooks with the _exact same `source` and `importer`_ while handling the original `this.resolve` call, then the `resolveId` hook of the original plugin will be skipped for those calls as well. The rationale here is that the plugin already stated that it "does not know" how to resolve this particular combination of `source` and `importer` at this point in time. If you do not want this behaviour, set `skipSelf` to `false` and implement your own infinite loop prevention mechanism if necessary.

You can also pass an object of plugin-specific options via the `custom` option, see [custom resolver options](#custom-resolver-options) for details.

The value for `isEntry` you pass here will be passed along to the [`resolveId`](#resolveid) hooks handling this call, otherwise `false` will be passed if there is an importer and `true` if there is not.

If you pass an object for `attributes`, it will simulate resolving an import with an assertion, e.g. `attributes: {type: "json"}` simulates resolving `import "foo" assert {type: "json"}`. This will be passed to any [`resolveId`](#resolveid) hooks handling this call and may ultimately become part of the returned object.

When calling this function from a `resolveId` hook, you should always check if it makes sense for you to pass along the `isEntry`, `custom` and `attributes` options.

The value of `resolvedBy` refers to which plugin resolved this source. If it was resolved by Rollup itself, the value will be "rollup". If a `resolveId` hook in a plugin resolves this source, the value will be the name of the plugin unless it returned an explicit value for `resolvedBy`. This flag is only for debugging and documentation purposes and is not processed further by Rollup.

### this.setAssetSource

|       |                                                               |
| ----: | :------------------------------------------------------------ |
| Type: | `(referenceId: string, source: string \| Uint8Array) => void` |

Set the deferred source of an asset. Note that you can also pass a Node `Buffer` as `source` as it is a sub-class of `Uint8Array`.

### this.warn

|  |  |
| --: | :-- |
| Type: | `(log: string \| RollupLog \| (() => RollupLog \| string), position?: number \| { column: number; line: number }) => void` |

Using this method will generate warnings for a build, which are logs with log level `"warn"`. See the [`onLog`](../configuration-options/index.md#onlog) option for information about the `RollupLog` type. To generate other logs, see also [`this.info`](#this-info) and [`this.debug`](#this-debug). To generate errors, see [`this.error`](#this-error).

Just like internally generated warnings, these logs will be first passed to and filtered by plugin [`onLog`](#onlog) hooks before they are forwarded to custom [`onLog`](../configuration-options/index.md#onlog) or [`onwarn`](../configuration-options/index.md#onwarn) handlers or printed to the console.

The `warning` argument can be a `string` or an object with (at minimum) a `message` property:

```js
this.warn('hmm...');
// is equivalent to
this.warn({
	message: 'hmm...',
	pluginCode: 'CODE_TO_IDENTIFY_LOG',
	meta: 'Additional plugin specific information'
});
```

We encourage you to use objects with a `pluginCode` property as that will allow users to easily filter for those logs in an `onLog` handler. If you need to add additional information, you can use the `meta` property. If the log contains a `code` and does not yet have a `pluginCode` property, it will be renamed to `pluginCode` as plugin warnings always get a `code` of `PLUGIN_WARNING` added by Rollup. To prevent this behavior, plugins can instead use the normalized `onLog` option passed to the [`buildStart`](#buildstart) hook. Calling this option from a plugin will not change properties when passing the log to plugin `onLog` handlers and `onLog` or `onwarn` handlers.

If you need to do expensive computations to generate a log, you can also pass a function returning either a `string` or a `RollupLog` object. This function will only be called if the log is not filtered by the [`logLevel`](../configuration-options/index.md#loglevel) option.

```js
// This will only run if the logLevel is set to "debug"
this.debug(() => generateExpensiveDebugLog());
```

When used in the `transform` hook, the `id` of the current module will also be added and a `position` can be supplied. This is a character index or file location which will be used to augment the log with `pos`, `loc` (a standard `{ file, line, column }` object) and `frame` (a snippet of code showing the location).

If the [`logLevel`](../configuration-options/index.md#loglevel) option is set to `"silent"`, this method will do nothing.

## File URLs

To reference a file URL reference from within JS code, use the `import.meta.ROLLUP_FILE_URL_referenceId` replacement. This will generate code that depends on the output format and generates a URL that points to the emitted file in the target environment. Note that all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available.

The following example will detect imports of `.svg` files, emit the imported files as assets, and return their URLs to be used e.g. as the `src` attribute of an `img` tag:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function svgResolverPlugin() {
	return {
		name: 'svg-resolver',
		resolveId(source, importer) {
			if (source.endsWith('.svg')) {
				return path.resolve(path.dirname(importer), source);
			}
		},
		load(id) {
			if (id.endsWith('.svg')) {
				const referenceId = this.emitFile({
					type: 'asset',
					name: path.basename(id),
					source: fs.readFileSync(id)
				});
				return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
			}
		}
	};
}
```

Usage:

```js
import logo from '../images/logo.svg';
const image = document.createElement('img');
image.src = logo;
document.body.appendChild(image);
```

Sometimes, the code which referenced this asset is only used conditionally like in the following example:

```js
import logo from '../images/logo.svg';
if (COMPILER_FLAG) {
	const image = document.createElement('img');
	image.src = logo;
	document.body.appendChild(image);
}
```

If a plugin replaces `COMPILER_FLAG` with `false`, then we will get an unexpected result: The unreferenced asset is still emitted but unused. We can resolve this problem by setting `needsCodeReference` to true when calling [`this.emitFile`](#this-emitfile), like in the following code:

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function svgResolverPlugin() {
	return {
		/* ... */
		load(id) {
			if (id.endsWith('.svg')) {
				const referenceId = this.emitFile({
					type: 'asset',
					name: path.basename(id),
					needsCodeReference: true,
					source: fs.readFileSync(id)
				});
				return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
			}
		}
	};
}
```

Now the asset will only be added to the bundle if the reference `import.meta.ROLLUP_FILE_URL_referenceId` is actually used in the code.

Similar to assets, emitted chunks can be referenced from within JS code via `import.meta.ROLLUP_FILE_URL_referenceId` as well.

The following example will detect imports prefixed with `register-paint-worklet:` and generate the necessary code and separate chunk to generate a CSS paint worklet. Note that this will only work in modern browsers and will only work if the output format is set to `es`.

```js twoslash
const REGISTER_WORKLET = 'register-paint-worklet:';

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function registerPaintWorkletPlugin() {
	return {
		name: 'register-paint-worklet',
		load(id) {
			if (id.startsWith(REGISTER_WORKLET)) {
				return `CSS.paintWorklet.addModule(import.meta.ROLLUP_FILE_URL_${this.emitFile(
					{
						type: 'chunk',
						id: id.slice(REGISTER_WORKLET.length)
					}
				)});`;
			}
		},
		resolveId(source, importer) {
			// We remove the prefix, resolve everything to absolute ids and
			// add the prefix again. This makes sure that you can use
			// relative imports to define worklets
			if (source.startsWith(REGISTER_WORKLET)) {
				return this.resolve(
					source.slice(REGISTER_WORKLET.length),
					importer
				).then(resolvedId => REGISTER_WORKLET + resolvedId.id);
			}
			return null;
		}
	};
}
```

Usage:

```js
// main.js
import 'register-paint-worklet:./worklet.js';
import { color, size } from './config.js';
document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${color}, size: ${size}</h1>`;

// worklet.js
import { color, size } from './config.js';
registerPaint(
	'vertical-lines',
	class {
		paint(ctx, geom) {
			for (let x = 0; x < geom.width / size; x++) {
				ctx.beginPath();
				ctx.fillStyle = color;
				ctx.rect(x * size, 0, 2, geom.height);
				ctx.fill();
			}
		}
	}
);

// config.js
export const color = 'greenyellow';
export const size = 6;
```

If you build this code, both the main chunk and the worklet will share the code from `config.js` via a shared chunk. This enables us to make use of the browser cache to reduce transmitted data and speed up loading the worklet.

## Transformers

Transformer plugins (i.e. those that return a `transform` function for e.g. transpiling non-JS files) should support `options.include` and `options.exclude`, both of which can be a minimatch pattern or an array of minimatch patterns. If `options.include` is omitted or of zero length, files should be included by default; otherwise they should only be included if the ID matches one of the patterns.

The `transform` hook, if returning an object, can also include an `ast` property. Only use this feature if you know what you're doing. Note that only the last AST in a chain of transforms will be used (and if there are transforms, any ASTs generated by the `load` hook will be discarded for the transformed modules.)

### Example Transformer

(Use [@rollup/pluginutils](https://github.com/rollup/plugins/tree/master/packages/pluginutils) for commonly needed functions, and to implement a transformer in the recommended manner.)

```js twoslash
import { createFilter } from '@rollup/pluginutils';

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function transformCodePlugin(options = {}) {
	const filter = createFilter(options.include, options.exclude);

	return {
		name: 'transform-code',
		transform(code, id) {
			if (!filter(id)) return;

			// proceed with the transformation...
			return {
				code: generatedCode,
				map: generatedSourceMap
			};
		}
	};
}
```

### Source Code Transformations

If a plugin transforms source code, it should generate a sourcemap automatically, unless there's a specific `sourceMap: false` option. Rollup only cares about the `mappings` property (everything else is handled automatically). [magic-string](https://github.com/Rich-Harris/magic-string) provides a simple way to generate such a map for elementary transformations like adding or removing code snippets.

If it doesn't make sense to generate a sourcemap, (e.g. [rollup-plugin-string](https://github.com/TrySound/rollup-plugin-string)), return an empty sourcemap:

```js
return {
	code: transformedCode,
	map: { mappings: '' }
};
```

If the transformation does not move code, you can preserve existing sourcemaps by returning `null`:

```js
return {
	code: transformedCode,
	map: null
};
```

If you create a plugin that you think would be useful to others, please publish it to NPM and add submit it to [github.com/rollup/awesome](https://github.com/rollup/awesome)!

## Synthetic named exports

It is possible to designate a fallback export for missing exports by setting the `syntheticNamedExports` option for a module in the [`resolveId`](#resolveid), [`load`](#load) or [`transform`](#transform) hook. If a string value is used for `syntheticNamedExports`, this module will fallback the resolution of any missing named exports to properties of the named export of the given name:

**dep.js: (`{syntheticNamedExports: '__synthetic'}`)**

```js
export const foo = 'explicit';
export const __synthetic = {
	foo: 'foo',
	bar: 'bar'
};
```

**main.js:**

```js
import { foo, bar, baz, __synthetic } from './dep.js';

// logs "explicit" as non-synthetic exports take precedence
console.log(foo);

// logs "bar", picking the property from __synthetic
console.log(bar);

// logs "undefined"
console.log(baz);

// logs "{foo:'foo',bar:'bar'}"
console.log(__synthetic);
```

When used as an entry point, only explicit exports will be exposed. The synthetic fallback export, i.e. `__synthetic` in the example, will not be exposed for string values of `syntheticNamedExports`. However, if the value is `true`, the default export will be exposed. This is the only notable difference between `syntheticNamedExports: true` and `syntheticNamedExports: 'default'`.

## Inter-plugin communication

At some point when using many dedicated plugins, there may be the need for unrelated plugins to be able to exchange information during the build. There are several mechanisms through which Rollup makes this possible.

### Custom resolver options

Assume you have a plugin that should resolve an import to different ids depending on how the import was generated by another plugin. One way to achieve this would be to rewrite the import to use special proxy ids, e.g. a transpiled import via `require("foo")` in a CommonJS file could become a regular import with a special id `import "foo?require=true"` so that a resolver plugin knows this.

The problem here, however, is that this proxy id may or may not cause unintended side effects when passed to other resolvers because it does not really correspond to a file. Moreover, if the id is created by plugin `A` and the resolution happens in plugin `B`, it creates a dependency between these plugins so that `A` is not usable without `B`.

Custom resolver option offer a solution here by allowing to pass additional options for plugins when manually resolving a module via `this resolve`. This happens without changing the id and thus without impairing the ability for other plugins to resolve the module correctly if the intended target plugin is not present.

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function requestingPlugin() {
	return {
		name: 'requesting',
		async buildStart() {
			const resolution = await this.resolve('foo', undefined, {
				custom: { resolving: { specialResolution: true } }
			});
			console.log(resolution.id); // "special"
		}
	};
}

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function resolvingPlugin() {
	return {
		name: 'resolving',
		resolveId(id, importer, { custom }) {
			if (custom.resolving?.specialResolution) {
				return 'special';
			}
			return null;
		}
	};
}
```

Note the convention that custom options should be added using a property corresponding to the plugin name of the resolving plugin. It is responsibility of the resolving plugin to specify which options it respects.

### Custom module meta-data

Plugins can annotate modules with custom meta-data which can be set by themselves and other plugins via the [`resolveId`](#resolveid), [`load`](#load), and [`transform`](#transform) hooks and accessed via [`this.getModuleInfo`](#this-getmoduleinfo), [`this.load`](#this-load) and the [`moduleParsed`](#moduleparsed) hook. This meta-data should always be JSON.stringifyable and will be persisted in the cache e.g. in watch mode.

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function annotatingPlugin() {
	return {
		name: 'annotating',
		transform(code, id) {
			if (thisModuleIsSpecial(code, id)) {
				return { meta: { annotating: { special: true } } };
			}
		}
	};
}

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function readingPlugin() {
	let parentApi;
	return {
		name: 'reading',
		buildEnd() {
			const specialModules = Array.from(this.getModuleIds()).filter(
				id => this.getModuleInfo(id).meta.annotating?.special
			);
			// do something with this list
		}
	};
}
```

Note the convention that plugins that add or modify data should use a property corresponding to the plugin name, in this case `annotating`. On the other hand, any plugin can read all meta-data from other plugins via `this.getModuleInfo`.

If several plugins add meta-data or meta-data is added in different hooks, then these `meta` objects will be merged shallowly. That means if plugin `first` adds `{meta: {first: {resolved: "first"}}}` in the resolveId hook and `{meta: {first: {loaded: "first"}}}` in the load hook while plugin `second` adds `{meta: {second: {transformed: "second"}}}` in the `transform` hook, then the resulting `meta` object will be `{first: {loaded: "first"}, second: {transformed: "second"}}`. Here the result of the `resolveId` hook will be overwritten by the result of the `load` hook as the plugin was both storing them under its `first` top-level property. The `transform` data of the other plugin on the other hand will be placed next to it.

The `meta` object of a module is created as soon as Rollup starts loading a module and is updated for each lifecycle hook of the module. If you store a reference to this object, you can also update it manually. To access the meta object of a module that has not been loaded yet, you can trigger its creation and loading the module via [`this.load`](#this-load):

```js twoslash
// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function plugin() {
	return {
		name: 'test',
		buildStart() {
			// trigger loading a module. We could also pass an initial
			// "meta" object here, but it would be ignored if the module
			// was already loaded via other means
			this.load({ id: 'my-id' });
			// the module info is now available, we do not need to await
			// this.load
			const meta = this.getModuleInfo('my-id').meta;
			// we can also modify meta manually now
			meta.test = { some: 'data' };
		}
	};
}
```

### Direct plugin communication

For any other kind of inter-plugin communication, we recommend the pattern below. Note that `api` will never conflict with any upcoming plugin hooks.

<!-- prettier-ignore-start -->
```js twoslash
/** @typedef {{ doSomething(...args: any[]): void }} ParentPluginApi */

/** @returns {import('rollup').Plugin<ParentPluginApi>} */
// ---cut---
function parentPlugin() {
	return {
		name: 'parent',
		api: {
			//...methods and properties exposed for other plugins
			doSomething(...args) {
				// do something interesting
			}
		}
		// ...plugin hooks
	};
}

// ---cut-start---
/** @returns {import('rollup').Plugin} */
// ---cut-end---
function dependentPlugin() {
// ---cut-start---
	/** @type {ParentPluginApi} */
// ---cut-end---
	let parentApi;
	return {
		name: 'dependent',
		buildStart({ plugins }) {
			const parentName = 'parent';
// ---cut-start---
			/** @type {import('rollup').Plugin<ParentPluginApi> | undefined} */
// ---cut-end---
			const parentPlugin = plugins.find(
				plugin => plugin.name === parentName
			);
			if (!parentPlugin) {
				// or handle this silently if it is optional
				throw new Error(
					`This plugin depends on the "${parentName}" plugin.`
				);
			}
			// now you can access the API methods in subsequent hooks
			parentApi = parentPlugin.api;
		},
		transform(code, id) {
			if (thereIsAReasonToDoSomething(id)) {
				parentApi.doSomething(id);
			}
		}
	};
}
```
<!-- prettier-ignore-end -->
