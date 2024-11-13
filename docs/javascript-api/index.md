---
title: JavaScript API
---

# {{ $frontmatter.title }}

[[toc]]

Rollup provides a JavaScript API which is usable from Node.js. You will rarely need to use this, and should probably be using the command line API unless you are extending Rollup itself or using it for something esoteric, such as generating bundles programmatically.

## rollup.rollup

The `rollup.rollup` function receives an input options object as parameter and returns a Promise that resolves to a `bundle` object with various properties and methods as shown below. During this step, Rollup will build the module graph and perform tree-shaking, but will not generate any output.

On a `bundle` object, you can call `bundle.generate` multiple times with different output options objects to generate different bundles in-memory. If you directly want to write them to disk, use `bundle.write` instead.

Once you're finished with the `bundle` object, you should call `bundle.close()`, which will let plugins clean up their external processes or services via the [`closeBundle`](../plugin-development/index.md#closebundle) hook.

If an error occurs at either stage, it will return a Promise rejected with an Error, which you can identify via their `code` property. Besides `code` and `message`, many errors have additional properties you can use for custom reporting, see [`utils/logs.ts`](https://github.com/rollup/rollup/blob/master/src/utils/logs.ts) for a complete list of errors and logs together with their codes and properties.

<!-- prettier-ignore-start -->
```javascript twoslash
import { rollup } from 'rollup';

// see below for details on these options
// ---cut-start---
/** @type {import('rollup').InputOptions} */
// ---cut-end---
const inputOptions = {
	/* ... */
};

// you can create multiple outputs from the same input to generate e.g.
// different formats like CommonJS and ESM
// ---cut-start---
/** @type {import('rollup').OutputOptions[]} */
// ---cut-end---
const outputOptionsList = [
	{
		/* ... */
	},
	{
		/* ... */
	}
];

build();

async function build() {
// ---cut-start---
	/** @type {import('rollup').RollupBuild} */
// ---cut-end---
	let bundle;
	let buildFailed = false;
	try {
		// Create a bundle. If you are using TypeScript or a runtime that
		// supports it, you can write
		//
		// await using bundle = await rollup(inputOptions);
		//
		// instead and do not need to close the bundle explicitly below.
		bundle = await rollup(inputOptions);

		// an array of file names this bundle depends on
		console.log(bundle.watchFiles);

		await generateOutputs(bundle);
	} catch (error) {
		buildFailed = true;
		// do some error reporting
		console.error(error);
	}
	if (bundle) {
		// closes the bundle
		await bundle.close();
	}
	process.exit(buildFailed ? 1 : 0);
}

// ---cut-start---
/** @param {import('rollup').RollupBuild} [bundle] */
// ---cut-end---
async function generateOutputs(bundle) {
	for (const outputOptions of outputOptionsList) {
		// generate output specific code in-memory
		// you can call this function multiple times on the same bundle object
		// replace bundle.generate with bundle.write to directly write to disk
		const { output } = await bundle.generate(outputOptions);

		for (const chunkOrAsset of output) {
			if (chunkOrAsset.type === 'asset') {
				// For assets, this contains
				// {
				//   fileName: string,              // the asset file name
				//   source: string | Uint8Array    // the asset source
				//   type: 'asset'                  // signifies that this is an asset
				// }
				console.log('Asset', chunkOrAsset);
			} else {
				// For chunks, this contains
				// {
				//   code: string,                  // the generated JS code
				//   dynamicImports: string[],      // external modules imported dynamically by the chunk
				//   exports: string[],             // exported variable names
				//   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
				//   fileName: string,              // the chunk file name
				//   implicitlyLoadedBefore: string[]; // entries that should only be loaded after this chunk
				//   imports: string[],             // external modules imported statically by the chunk
				//   importedBindings: {[imported: string]: string[]} // imported bindings per dependency
				//   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
				//   isEntry: boolean,              // is this chunk a static entry point
				//   isImplicitEntry: boolean,      // should this chunk only be loaded after other chunks
				//   map: string | null,            // sourcemaps if present
				//   modules: {                     // information about the modules in this chunk
				//     [id: string]: {
				//       renderedExports: string[]; // exported variable names that were included
				//       removedExports: string[];  // exported variable names that were removed
				//       renderedLength: number;    // the length of the remaining code in this module
				//       originalLength: number;    // the original length of the code in this module
				//       code: string | null;       // remaining code in this module
				//     };
				//   },
				//   name: string                   // the name of this chunk as used in naming patterns
				//   preliminaryFileName: string    // the preliminary file name of this chunk with hash placeholders
				//   referencedFiles: string[]      // files referenced via import.meta.ROLLUP_FILE_URL_<id>
				//   type: 'chunk',                 // signifies that this is a chunk
				// }
				console.log('Chunk', chunkOrAsset.modules);
			}
		}
	}
}
```
<!-- prettier-ignore-end -->

### inputOptions object

The `inputOptions` object can contain the following properties (see the [big list of options](../configuration-options/index.md) for full details on these):

```js twoslash
// ---cut-start---
/** @type {import('rollup').InputOptions} */
// ---cut-end---
const inputOptions = {
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
	perf
};
```

### outputOptions object

The `outputOptions` object can contain the following properties (see the [big list of options](../configuration-options/index.md) for full details on these):

```js twoslash
// ---cut-start---
/** @type {import('rollup').OutputOptions} */
// ---cut-end---
const outputOptions = {
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
	reexportProtoFromExternal,
	sanitizeFileName,
	strict,
	systemNullSetters,

	// experimental
	experimentalMinChunkSize
};
```

## rollup.watch

Rollup also provides a `rollup.watch` function that rebuilds your bundle when it detects that the individual modules have changed on disk. It is used internally when you run Rollup from the command line with the `--watch` flag. Note that when using watch mode via the JavaScript API, it is your responsibility to call `event.result.close()` in response to the `BUNDLE_END` event to allow plugins to clean up resources in the [`closeBundle`](../plugin-development/index.md#closebundle) hook, see below.

```js twoslash
const rollup = require('rollup');

// ---cut-start---
/** @type {import('rollup').RollupWatchOptions} */
// ---cut-end---
const watchOptions = {
	/*...*/
};
const watcher = rollup.watch(watchOptions);

watcher.on('event', event => {
	// event.code can be one of:
	//   START        — the watcher is (re)starting
	//   BUNDLE_START — building an individual bundle
	//                  * event.input will be the input options object if present
	//                  * event.output contains an array of the "file" or
	//                    "dir" option values of the generated outputs
	//   BUNDLE_END   — finished building a bundle
	//                  * event.input will be the input options object if present
	//                  * event.output contains an array of the "file" or
	//                    "dir" option values of the generated outputs
	//                  * event.duration is the build duration in milliseconds
	//                  * event.result contains the bundle object that can be
	//                    used to generate additional outputs by calling
	//                    bundle.generate or bundle.write. This is especially
	//                    important when the watch.skipWrite option is used.
	//                  You should call "event.result.close()" once you are done
	//                  generating outputs, or if you do not generate outputs.
	//                  This will allow plugins to clean up resources via the
	//                  "closeBundle" hook.
	//   END          — finished building all bundles
	//   ERROR        — encountered an error while bundling
	//                  * event.error contains the error that was thrown
	//                  * event.result is null for build errors and contains the
	//                    bundle object for output generation errors. As with
	//                    "BUNDLE_END", you should call "event.result.close()" if
	//                    present once you are done.
	// If you return a Promise from your event handler, Rollup will wait until the
	// Promise is resolved before continuing.
});

// This will make sure that bundles are properly closed after each run
watcher.on('event', ({ result }) => {
	if (result) {
		result.close();
	}
});

// Additionally, you can hook into the following. Again, return a Promise to
// make Rollup wait at that stage:
watcher.on('change', (id, { event }) => {
	/* a file was modified */
});
watcher.on('restart', () => {
	/* a new run was triggered */
});
watcher.on('close', () => {
	/* the watcher was closed, see below */
});

// to stop watching
watcher.close();
```

### watchOptions

The `watchOptions` argument is a config (or an array of configs) that you would export from a config file.

```js twoslash
// ---cut-start---
/** @type {import('rollup').RollupWatchOptions} */
// ---cut-end---
const watchOptions = {
	...inputOptions,
	output: [outputOptions],
	watch: {
		buildDelay,
		chokidar,
		clearScreen,
		skipWrite,
		exclude,
		include
	}
};
```

See above for details on `inputOptions` and `outputOptions`, or consult the [big list of options](../configuration-options/index.md) for info on `chokidar`, `include` and `exclude`.

## Programmatically loading a config file

In order to aid in generating such a config, rollup exposes the helper it uses to load config files in its command line interface via a separate entry-point. This helper receives a resolved `fileName` and optionally an object containing command line parameters:

```js twoslash
const { loadConfigFile } = require('rollup/loadConfigFile');
const path = require('node:path');
const rollup = require('rollup');

// load the config file next to the current script;
// the provided config object has the same effect as passing "--format es"
// on the command line and will override the format of all outputs
loadConfigFile(path.resolve(__dirname, 'rollup.config.js'), {
	format: 'es'
}).then(async ({ options, warnings }) => {
	// "warnings" wraps the default `onwarn` handler passed by the CLI.
	// This prints all warnings up to this point:
	console.log(`We currently have ${warnings.count} warnings`);

	// This prints all deferred warnings
	warnings.flush();

	// options is an array of "inputOptions" objects with an additional
	// "output" property that contains an array of "outputOptions".
	// The following will generate all outputs for all inputs, and write
	// them to disk the same way the CLI does it:
	for (const optionsObj of options) {
		const bundle = await rollup.rollup(optionsObj);
		await Promise.all(optionsObj.output.map(bundle.write));
	}

	// You can also pass this directly to "rollup.watch"
	rollup.watch(options);
});
```

## Applying advanced log filters

While the command line interface provides a powerful way to filter logs via the [`--filterLogs`](../command-line-interface/index.md#filterlogs-filter) flag, this functionality is not directly available when using the JavaScript API. However, Rollup exposes a helper `getLogFilter` to generate filters using the same syntax as the CLI. This is useful when specifying a custom `onLog` handler and for third party systems that want to provide a similar filtering experience as Rollup CLI. This function accepts an array of strings. Note that it does not split up comma-separated lists of filters like the CLI does.

```js twoslash
// rollup.config.mjs
import { getLogFilter } from 'rollup/getLogFilter';

const logFilter = getLogFilter(['code:FOO', 'code:BAR']);

export default {
	input: 'main.js',
	output: { format: 'es' },
	onLog(level, log, handler) {
		if (logFilter(log)) {
			handler(level, log);
		}
	}
};
```

## Accessing the parser

In order to parse arbitrary code using Rollup's parser, plugins can use [`this.parse`](../plugin-development/index.md#this-parse). To use this functionality outside the context of a Rollup build, the parser is also exposed as a separate export. It has the same signature as `this.parse`:

```js twoslash
import { parseAst } from 'rollup/parseAst';
import assert from 'node:assert';

assert.deepEqual(
	parseAst('return 42;', { allowReturnOutsideFunction: true }),
	{
		type: 'Program',
		start: 0,
		end: 10,
		body: [
			{
				type: 'ReturnStatement',
				start: 0,
				end: 10,
				argument: {
					type: 'Literal',
					start: 7,
					end: 9,
					raw: '42',
					value: 42
				}
			}
		],
		sourceType: 'module'
	}
);
```

There is also an asynchronous version that parses in a different thread in the non-wasm builds of Rollup:

```js twoslash
import { parseAstAsync } from 'rollup/parseAst';
import assert from 'node:assert';

assert.deepEqual(
	await parseAstAsync('return 42;', { allowReturnOutsideFunction: true }),
	{
		type: 'Program',
		start: 0,
		end: 10,
		body: [
			{
				type: 'ReturnStatement',
				start: 0,
				end: 10,
				argument: {
					type: 'Literal',
					start: 7,
					end: 9,
					raw: '42',
					value: 42
				}
			}
		],
		sourceType: 'module'
	}
);
```
