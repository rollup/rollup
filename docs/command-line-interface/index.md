---
title: Command Line Interface
---

# {{ $frontmatter.title }}

[[toc]]

Rollup should typically be used from the command line. You can provide an optional Rollup configuration file to simplify command line usage and enable advanced Rollup functionality.

## Configuration Files

Rollup configuration files are optional, but they are powerful and convenient and thus **recommended**. A config file is an ES module that exports a default object with the desired options:

```javascript twoslash
/** @type {import('rollup').RollupOptions} */
// ---cut---
export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	}
};
```

Typically, it is called `rollup.config.js` or `rollup.config.mjs` and sits in the root directory of your project. Unless the [`--configPlugin`](#configplugin-plugin) or [`--bundleConfigAsCjs`](#bundleconfigascjs) options are used, Rollup will directly use Node to import the file. Note that there are some [caveats when using native Node ES modules](#caveats-when-using-native-node-es-modules) as Rollup will observe [Node ESM semantics](https://nodejs.org/docs/latest-v14.x/api/packages.html#packages_determining_module_system).

If you want to write your configuration as a CommonJS module using `require` and `module.exports`, you should change the file extension to `.cjs`.

You can also use other languages for your configuration files like TypeScript. To do that, install a corresponding Rollup plugin like `@rollup/plugin-typescript` and use the [`--configPlugin`](#configplugin-plugin) option:

```shell
rollup --config rollup.config.ts --configPlugin typescript
```

Using the `--configPlugin` option will always force your config file to be transpiled to CommonJS first. Also have a look at [Config Intellisense](#config-intellisense) for more ways to use TypeScript typings in your config files.

Config files support the options listed below. Consult the [big list of options](../configuration-options/index.md) for details on each option:

```javascript twoslash
// rollup.config.js

// can be an array (for multiple inputs)
// ---cut-start---
/** @type {import('rollup').RollupOptions} */
// ---cut-end---
export default {
	// core input options
	external,
	input, // conditionally required
	plugins,

	// advanced input options
	cache,
	logLevel,
	makeAbsoluteExternalsRelative,
	maxParallelFileOps,
	onLog,
	onwarn,
	preserveEntrySignatures,
	strictDeprecations,

	// danger zone
	context,
	moduleContext,
	preserveSymlinks,
	shimMissingExports,
	treeshake,

	// experimental
	experimentalCacheExpiry,
	experimentalLogSideEffects,
	experimentalMinChunkSize,
	perf,

	// required (can be an array, for multiple outputs)
	output: {
		// core output options
		dir,
		file,
		format,
		globals,
		name,
		plugins,

		// advanced output options
		assetFileNames,
		banner,
		chunkFileNames,
		compact,
		dynamicImportInCjs,
		entryFileNames,
		extend,
		externalImportAttributes,
		footer,
		generatedCode,
		hashCharacters,
		hoistTransitiveImports,
		importAttributesKey,
		inlineDynamicImports,
		interop,
		intro,
		manualChunks,
		minifyInternalExports,
		outro,
		paths,
		preserveModules,
		preserveModulesRoot,
		sourcemap,
		sourcemapBaseUrl,
		sourcemapDebugIds,
		sourcemapExcludeSources,
		sourcemapFile,
		sourcemapFileNames,
		sourcemapIgnoreList,
		sourcemapPathTransform,
		validate,

		// danger zone
		amd,
		esModule,
		exports,
		externalLiveBindings,
		freeze,
		indent,
		noConflict,
		sanitizeFileName,
		strict,
		systemNullSetters,

		// experimental
		experimentalMinChunkSize
	},

	watch: {
		buildDelay,
		chokidar,
		clearScreen,
		exclude,
		include,
		skipWrite,
		allowInputInsideOutputPath
	}
};
```

You can export an **array** from your config file to build bundles from several unrelated inputs at once, even in watch mode. To build different bundles with the same input, you supply an array of output options for each input:

```javascript twoslash
// rollup.config.js (building more than one bundle)

// ---cut-start---
/** @type {import('rollup').RollupOptions[]} */
// ---cut-end---
export default [
	{
		input: 'main-a.js',
		output: {
			file: 'dist/bundle-a.js',
			format: 'cjs'
		}
	},
	{
		input: 'main-b.js',
		output: [
			{
				file: 'dist/bundle-b1.js',
				format: 'cjs'
			},
			{
				file: 'dist/bundle-b2.js',
				format: 'es'
			}
		]
	}
];
```

If you want to create your config asynchronously, Rollup can also handle a `Promise` which resolves to an object or an array.

```javascript
// rollup.config.js
import fetch from 'node-fetch';

export default fetch('/some-remote-service-which-returns-actual-config');
```

Similarly, you can do this as well:

```javascript
// rollup.config.js (Promise resolving an array)
export default Promise.all([fetch('get-config-1'), fetch('get-config-2')]);
```

To use Rollup with a configuration file, pass the `--config` or `-c` flags:

```shell
# pass a custom config file location to Rollup
rollup --config my.config.js

# if you do not pass a file name, Rollup will try to load
# configuration files in the following order:
# rollup.config.mjs -> rollup.config.cjs -> rollup.config.js
rollup --config
```

You can also export a function that returns any of the above configuration formats. This function will be passed the current command line arguments so that you can dynamically adapt your configuration to respect e.g. [`--silent`](#silent). You can even define your own command line options if you prefix them with `config`:

```javascript twoslash
// rollup.config.js
import defaultConfig from './rollup.default.config.js';
import debugConfig from './rollup.debug.config.js';

// ---cut-start---
/** @type {import('rollup').RollupOptionsFunction} */
// ---cut-end---
export default commandLineArgs => {
	if (commandLineArgs.configDebug === true) {
		return debugConfig;
	}
	return defaultConfig;
};
```

If you now run `rollup --config --configDebug`, the debug configuration will be used.

By default, command line arguments will always override the respective values exported from a config file. If you want to change this behaviour, you can make Rollup ignore command line arguments by deleting them from the `commandLineArgs` object:

```javascript twoslash
// rollup.config.js
// ---cut-start---
/** @type {import('rollup').RollupOptionsFunction} */
// ---cut-end---
export default commandLineArgs => {
	const inputBase = commandLineArgs.input || 'main.js';

	// this will make Rollup ignore the CLI argument
	delete commandLineArgs.input;
	return {
		input: 'src/entries/' + inputBase,
		output: {
			/* ... */
		}
	};
};
```

### Config Intellisense

Since Rollup ships with TypeScript typings, you can leverage your IDE's Intellisense with JSDoc type hints:

```javascript twoslash
// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
	/* your config */
};
export default config;
```

Alternatively you can use the `defineConfig` helper, which should provide Intellisense without the need for JSDoc annotations:

```javascript twoslash
// rollup.config.js
import { defineConfig } from 'rollup';

export default defineConfig({
	/* your config */
});
```

Besides `RollupOptions` and the `defineConfig` helper that encapsulates this type, the following types can prove useful as well:

- `OutputOptions`: The `output` part of a config file
- `Plugin`: A plugin object that provides a `name` and some hooks. All hooks are fully typed to aid in plugin development.
- `PluginImpl`: A function that maps an options object to a plugin object. Most public Rollup plugins follow this pattern.

You can also directly write your config in TypeScript via the [`--configPlugin`](#configplugin-plugin) option. With TypeScript, you can import the `RollupOptions` type directly:

```typescript twoslash
import type { RollupOptions } from 'rollup';

const config: RollupOptions = {
	/* your config */
};
export default config;
```

## Differences to the JavaScript API

While config files provide an easy way to configure Rollup, they also limit how Rollup can be invoked and configured. Especially if you are bundling Rollup into another build tool or want to integrate it into an advanced build process, it may be better to directly invoke Rollup programmatically from your scripts.

If you want to switch from config files to using the [JavaScript API](../javascript-api/index.md) at some point, there are some important differences to be aware of:

- When using the JavaScript API, the configuration passed to `rollup.rollup` must be an object and cannot be wrapped in a Promise or a function.
- You can no longer use an array of configurations. Instead, you should run `rollup.rollup` once for each set of `inputOptions`.
- The `output` option will be ignored. Instead, you should run `bundle.generate(outputOptions)` or `bundle.write(outputOptions)` once for each set of `outputOptions`.

## Loading a configuration from a Node package

For interoperability, Rollup also supports loading configuration files from packages installed into `node_modules`:

```shell
# this will first try to load the package "rollup-config-my-special-config";
# if that fails, it will then try to load "my-special-config"
rollup --config node:my-special-config
```

## Caveats when using native Node ES modules

Especially when upgrading from an older Rollup version, there are some things you need to be aware of when using a native ES module for your configuration file.

### Getting the current directory

With CommonJS files, people often use `__dirname` to access the current directory and resolve relative paths to absolute paths. This is not supported for native ES modules. Instead, we recommend the following approach e.g. to generate an absolute id for an external module:

```js twoslash
// rollup.config.js
import { fileURLToPath } from 'node:url';

export default {
	/* ..., */
	// generates an absolute path for <currentdir>/src/some-file.js
	external: [fileURLToPath(new URL('src/some-file.js', import.meta.url))]
};
```

### Importing package.json

It can be useful to import your package file to e.g. mark your dependencies as "external" automatically. Depending on your Node version, there are different ways of doing that:

- For Node 18.20+, you can use an import attribute

  ```js twoslash
  import pkg from './package.json' with { type: 'json' };

  export default {
  	// Mark package dependencies as "external". Rest of configuration
  	// omitted.
  	external: Object.keys(pkg.dependencies)
  };
  ```

- For older Node versions, you can use `createRequire`

  ```js twoslash
  import { createRequire } from 'node:module';
  const require = createRequire(import.meta.url);
  const pkg = require('./package.json');

  // ...
  ```

- Or just directly read and parse the file from disk

  ```js twoslash
  // rollup.config.mjs
  import { readFileSync } from 'node:fs';

  // Use import.meta.url to make the path relative to the current source
  // file instead of process.cwd(). For more information:
  // https://nodejs.org/docs/latest-v16.x/api/esm.html#importmetaurl
  const packageJson = JSON.parse(
  	readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
  );

  // ...
  ```

## Command line flags

Many options have command line equivalents. In those cases, any arguments passed here will override the config file, if you're using one. This is a list of all supported options:

```
-c, --config <filename>     Use this config file (if argument is used but value
							is unspecified, Rollup will try to load configuration files
							in the following order:
							rollup.config.mjs -> rollup.config.cjs -> rollup.config.js)
-d, --dir <dirname>         Directory for chunks (if absent, prints to stdout)
-e, --external <ids>        Comma-separate list of module IDs to exclude
-f, --format <format>       Type of output (amd, cjs, es, iife, umd, system)
-g, --globals <pairs>       Comma-separate list of `moduleID:Global` pairs
-h, --help                  Show this help message
-i, --input <filename>      Input (alternative to <entry file>)
-m, --sourcemap             Generate sourcemap (`-m inline` for inline map)
-n, --name <name>           Name for UMD export
-o, --file <output>         Single output file (if absent, prints to stdout)
-p, --plugin <plugin>       Use the plugin specified (may be repeated)
-v, --version               Show version number
-w, --watch                 Watch files in bundle and rebuild on changes
--amd.autoId                Generate the AMD ID based off the chunk name
--amd.basePath <prefix>     Path to prepend to auto generated AMD ID
--amd.define <name>         Function to use in place of `define`
--amd.forceJsExtensionForImports Use `.js` extension in AMD imports
--amd.id <id>               ID for AMD module (default is anonymous)
--assetFileNames <pattern>  Name pattern for emitted assets
--banner <text>             Code to insert at top of bundle (outside wrapper)
--chunkFileNames <pattern>  Name pattern for emitted secondary chunks
--compact                   Minify wrapper code
--context <variable>        Specify top-level `this` value
--no-dynamicImportInCjs     Write external dynamic CommonJS imports as require
--entryFileNames <pattern>  Name pattern for emitted entry chunks
--environment <values>      Settings passed to config file (see example)
--no-esModule               Do not add __esModule property
--exports <mode>            Specify export mode (auto, default, named, none)
--extend                    Extend global variable defined by --name
--no-externalImportAttributes Omit import attributes in "es" output
--no-externalLiveBindings   Do not generate code to support live bindings
--failAfterWarnings         Exit with an error if the build produced warnings
--filterLogs <filter>       Filter log messages
--footer <text>             Code to insert at end of bundle (outside wrapper)
--forceExit                 Force exit the process when done
--no-freeze                 Do not freeze namespace objects
--generatedCode <preset>    Which code features to use (es5/es2015)
--generatedCode.arrowFunctions Use arrow functions in generated code
--generatedCode.constBindings Use "const" in generated code
--generatedCode.objectShorthand Use shorthand properties in generated code
--no-generatedCode.reservedNamesAsProps Always quote reserved names as props
--generatedCode.symbols     Use symbols in generated code
--hashCharacters <name>     Use the specified character set for file hashes
--no-hoistTransitiveImports Do not hoist transitive imports into entry chunks
--importAttributesKey <name> Use the specified keyword for import attributes
--no-indent                 Don't indent result
--inlineDynamicImports      Create single bundle when using dynamic imports
--no-interop                Do not include interop block
--intro <text>              Code to insert at top of bundle (inside wrapper)
--logLevel <level>          Which kind of logs to display
--no-makeAbsoluteExternalsRelative Prevent normalization of external imports
--maxParallelFileOps <value> How many files to read in parallel
--minifyInternalExports     Force or disable minification of internal exports
--noConflict                Generate a noConflict method for UMD globals
--outro <text>              Code to insert at end of bundle (inside wrapper)
--perf                      Display performance timings
--no-preserveEntrySignatures Avoid facade chunks for entry points
--preserveModules           Preserve module structure
--preserveModulesRoot       Put preserved modules under this path at root level
--preserveSymlinks          Do not follow symlinks when resolving files
--no-reexportProtoFromExternal Ignore `__proto__` in star re-exports
--no-sanitizeFileName       Do not replace invalid characters in file names
--shimMissingExports        Create shim variables for missing exports
--silent                    Don't print warnings
--sourcemapBaseUrl <url>    Emit absolute sourcemap URLs with given base
--sourcemapDebugIds         Emit unique debug ids in source and sourcemaps
--sourcemapExcludeSources   Do not include source code in source maps
--sourcemapFile <file>      Specify bundle position for source maps
--sourcemapFileNames <pattern> Name pattern for emitted sourcemaps
--stdin=ext                 Specify file extension used for stdin input
--no-stdin                  Do not read "-" from stdin
--no-strict                 Don't emit `"use strict";` in the generated modules
--strictDeprecations        Throw errors for deprecated features
--no-systemNullSetters      Do not replace empty SystemJS setters with `null`
--no-treeshake              Disable tree-shaking optimisations
--no-treeshake.annotations  Ignore pure call annotations
--treeshake.correctVarValueBeforeDeclaration Deoptimize variables until declared
--treeshake.manualPureFunctions <names> Manually declare functions as pure
--no-treeshake.moduleSideEffects Assume modules have no side effects
--no-treeshake.propertyReadSideEffects Ignore property access side effects
--no-treeshake.tryCatchDeoptimization Do not turn off try-catch-tree-shaking
--no-treeshake.unknownGlobalSideEffects Assume unknown globals do not throw
--validate                  Validate output
--waitForBundleInput        Wait for bundle input files
--watch.allowInputInsideOutputPath Whether the input path is allowed to be a
									subpath of the output path
--watch.buildDelay <number> Throttle watch rebuilds
--no-watch.clearScreen      Do not clear the screen when rebuilding
--watch.exclude <files>     Exclude files from being watched
--watch.include <files>     Limit watching to specified files
--watch.onBundleEnd <cmd>   Shell command to run on `"BUNDLE_END"` event
--watch.onBundleStart <cmd> Shell command to run on `"BUNDLE_START"` event
--watch.onEnd <cmd>         Shell command to run on `"END"` event
--watch.onError <cmd>       Shell command to run on `"ERROR"` event
--watch.onStart <cmd>       Shell command to run on `"START"` event
--watch.skipWrite           Do not write files to disk when watching
```

The flags listed below are only available via the command line interface. All other flags correspond to and override their config file equivalents, see the [big list of options](../configuration-options/index.md) for details.

### `--bundleConfigAsCjs`

This option will force your configuration to be transpiled to CommonJS.

This allows you to use CommonJS idioms like `__dirname` or `require.resolve` in your configuration even if the configuration itself is written as an ES module.

### `--configImportAttributesKey <with | assert>`

Controls the keyword Rollup uses for import attributes in your config file.

```shell
rollup --config rollup.config.ts --configPlugin typescript --configImportAttributesKey with
```

This option only available if the [`--configPlugin`](#configplugin-plugin) or [`--bundleConfigAsCjs`](#bundleconfigascjs) options are used.

### `--configPlugin <plugin>`

Allows specifying Rollup plugins to transpile or otherwise control the parsing of your configuration file. The main benefit is that it allows you to use non-JavaScript configuration files. For instance the following will allow you to write your configuration in TypeScript, provided you have `@rollup/plugin-typescript` installed:

```shell
rollup --config rollup.config.ts --configPlugin @rollup/plugin-typescript
```

Note for Typescript: make sure you have the Rollup config file in your `tsconfig.json`'s `include` paths. For example:

```
"include": ["src/**/*", "rollup.config.ts"],
```

This option supports the same syntax as the [`--plugin`](#p-plugin-plugin-plugin) option i.e., you can specify the option multiple times, you can omit the `@rollup/plugin-` prefix and just write `typescript` and you can specify plugin options via `={...}`.

Using this option will make Rollup transpile your configuration file to an ES module first before executing it. To transpile to CommonJS instead, also pass the [`--bundleConfigAsCjs`](#bundleconfigascjs) option.

### `--environment <values>`

Pass additional settings to the config file via `process.ENV`.

```shell
rollup -c --environment INCLUDE_DEPS,BUILD:production
```

will set `process.env.INCLUDE_DEPS === 'true'` and `process.env.BUILD === 'production'`. You can use this option several times. In that case, subsequently set variables will overwrite previous definitions. This enables you for instance to overwrite environment variables in `package.json` scripts:

```json
{
	"scripts": {
		"build": "rollup -c --environment INCLUDE_DEPS,BUILD:production"
	}
}
```

If you call this script via:

```shell
npm run build -- --environment BUILD:development
```

then the config file will receive `process.env.INCLUDE_DEPS === 'true'` and `process.env.BUILD === 'development'`.

### `--failAfterWarnings`

Exit the build with an error if any warnings occurred, once the build is complete.

### `--filterLogs <filter>`

Only display certain log messages based on custom filters. In its most basic form, a filter is a `key:value` pair where the key is a property of the log object and the value is an allowed value. For instance

```shell
rollup -c --filterLogs code:EVAL
```

will only display log messages where `log.code === 'EVAL'`. You can specify multiple filters by separating them with a comma or using the option multiple times:

```shell
rollup -c --filterLogs "code:FOO,message:This is the message" --filterLogs code:BAR
```

This will display all logs where the `code` is either `"FOO"` or `"BAR"` or where the `message` is `"This is the message"`.

For situations where you cannot easily add additional command line parameters, you can also use the `ROLLUP_FILTER_LOGS` environment variable. The value of this variable will be handled the same way as if you specified `--filterLogs` on the command line and supports a comma-separated list of filters.

There is also some advanced syntax available for more complex filters.

- `!` will negate a filter:

  ```shell
  rollup -c --filterLogs "!code:CIRCULAR_DEPENDENCY"
  ```

  will display all logs except circular dependency warnings.

- `*` matches any sub-string when used in a filter value:

  ```shell
  rollup -c --filterLogs "code:*_ERROR,message:*error*"
  ```

  will only display logs where either the `code` ends with `_ERROR` or the message contains the string `error`.

- `&` intersects several filters:

  ```shell
  rollup -c --filterLogs "code:CIRCULAR_DEPENDENCY&ids:*/main.js*"
  ```

  will only display logs where both the `code` is `"CIRCULAR_DEPENDENCY"` and the `ids` contain `/main.js`. This makes use of another feature:

- if the value is an object, it will be converted to a string via `JSON.stringify` before applying the filter. Other non-string values will be directly cast to string.
- nested properties are supported as well:

  ```shell
  rollup -c --filterLogs "foo.bar:value"
  ```

  will only display logs where the property `log.foo.bar` has the value `"value"`.

### `--forceExit`

Force exit the process when done. In some cases plugins or their dependencies might not cleanup properly and prevent the CLI process from exiting. The root cause can be hard to diagnose and this flag provides an escape hatch until it can be identified and resolved.

Note that this might break certain workflows and won't always work properly.

### `-h`/`--help`

Print the help document.

### `-p <plugin>`, `--plugin <plugin>`

Use the specified plugin. There are several ways to specify plugins here:

- Via a relative path:

  ```shell
  rollup -i input.js -f es -p ./my-plugin.js
  ```

  The file should export a function returning a plugin object.

- Via the name of a plugin that is installed in a local or global `node_modules` folder:

  ```shell
  rollup -i input.js -f es -p @rollup/plugin-node-resolve
  ```

  If the plugin name does not start with `rollup-plugin-` or `@rollup/plugin-`, Rollup will automatically try adding these prefixes:

  ```shell
  rollup -i input.js -f es -p node-resolve
  ```

- Via an inline implementation:

  ```shell
  rollup -i input.js -f es -p '{transform: (c, i) => `/* ${JSON.stringify(i)} */\n${c}`}'
  ```

If you want to load more than one plugin, you can repeat the option or supply a comma-separated list of names:

```shell
rollup -i input.js -f es -p node-resolve -p commonjs,json
```

By default, plugin functions will be called with no argument to create the plugin. You can however pass a custom argument as well:

```shell
rollup -i input.js -f es -p 'terser={output: {beautify: true, indent_level: 2}}'
```

### `--silent`

Don't print warnings to the console. If your configuration file contains an `onLog` or `onwarn` handler, this handler will still be called. The same goes for plugins with an `onLog` hook. To prevent that, additionally use the [`logLevel`](../configuration-options/index.md#loglevel) option or pass `--logLevel silent`.

### `--stdin=ext`

Specify a virtual file extension when reading content from stdin. By default, Rollup will use the virtual file name `-` without an extension for content read from stdin. Some plugins, however, rely on file extensions to determine if they should process a file. See also [Reading a file from stdin](#reading-a-file-from-stdin).

### `--no-stdin`

Do not read files from `stdin`. Setting this flag will prevent piping content to Rollup and make sure Rollup interprets `-` and `-.[ext]` as a regular file names instead of interpreting these as the name of `stdin`. See also [Reading a file from stdin](#reading-a-file-from-stdin).

### `-v`/`--version`

Print the installed version number.

### `--waitForBundleInput`

This will not throw an error if one of the entry point files is not available. Instead, it will wait until all files are present before starting the build. This is useful, especially in watch mode, when Rollup is consuming the output of another process.

### `-w`/`--watch`

Rebuild the bundle when its source files change on disk.

_Note: While in watch mode, the `ROLLUP_WATCH` environment variable will be set to `"true"` by Rollup's command line interface and can be checked by other processes. Plugins should instead check [`this.meta.watchMode`](../plugin-development/index.md#this-meta), which is independent of the command line interface._

### `--watch.onStart <cmd>`, `--watch.onBundleStart <cmd>`, `--watch.onBundleEnd <cmd>`, `--watch.onEnd <cmd>`, `--watch.onError <cmd>`

When in watch mode, run a shell command `<cmd>` for a watch event code. See also [rollup.watch](../javascript-api/index.md#rollup-watch).

```shell
rollup -c --watch --watch.onEnd="node ./afterBuildScript.js"
```

## Reading a file from stdin

When using the command line interface, Rollup can also read content from stdin:

```shell
echo "export const foo = 42;" | rollup --format cjs --file out.js
```

When this file contains imports, Rollup will try to resolve them relative to the current working directory. When using a config file, Rollup will only use `stdin` as an entry point if the file name of the entry point is `-`. To read a non-entry-point file from stdin, just call it `-`, which is the file name that is used internally to reference `stdin`. I.e.

```js
import foo from '-';
```

in any file will prompt Rollup to try to read the imported file from `stdin` and assign the default export to `foo`. You can pass the [`--no-stdin`](#no-stdin) CLI flag to Rollup to treat `-` as a regular file name instead.

As some plugins rely on file extensions to process files, you can specify a file extension for stdin via `--stdin=ext` where `ext` is the desired extension. In that case, the virtual file name will be `-.ext`:

```shell
echo '{"foo": 42, "bar": "ok"}' | rollup --stdin=json -p json
```

The JavaScript API will always treat `-` and `-.ext` as regular file names.
