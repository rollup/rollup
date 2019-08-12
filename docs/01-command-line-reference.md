---
title: Command Line Interface
---

Rollup should typically be used from the command line. You can provide an  optional Rollup configuration file to simplify command line usage and enable advanced Rollup functionality.

### Configuration Files

Rollup configuration files are optional, but they are powerful and convenient and thus **recommended**.

A config file is an ES module that exports a default object with the desired options. Typically, it is called `rollup.config.js` and sits in the root directory of your project.

Also you can use CJS modules syntax for the config file.

```javascript
module.exports = {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
};
```

It may be pertinent if you want to use the config file not only from the command line, but also from your custom scripts programmatically.

Consult the [big list of options](guide/en/#big-list-of-options) for details on each option you can include in your config file.

```javascript
// rollup.config.js

export default { // can be an array (for multiple inputs)
  // core input options
  external,
  input, // required
  plugins,

  // advanced input options
  cache,
  inlineDynamicImports,
  manualChunks,
  onwarn,
  preserveModules,
  strictDeprecations,

  // danger zone
  acorn,
  acornInjectPlugins,
  context,
  moduleContext,
  preserveSymlinks,
  shimMissingExports,
  treeshake,

  // experimental
  chunkGroupingSize,
  experimentalCacheExpiry,
  experimentalOptimizeChunks,
  experimentalTopLevelAwait,
  perf,

  output: { // required (can be an array, for multiple outputs)
    // core output options
    dir,
    file,
    format, // required
    globals,
    name,

    // advanced output options
    assetFileNames,
    banner,
    chunkFileNames,
    compact,
    entryFileNames,
    extend,
    footer,
    interop,
    intro,
    outro,
    paths,
    sourcemap,
    sourcemapExcludeSources,
    sourcemapFile,
    sourcemapPathTransform,

    // danger zone
    amd,
    dynamicImportFunction,
    esModule,
    exports,
    externalLiveBindings,
    freeze,
    indent,
    namespaceToStringTag,
    noConflict,
    preferConst,
    strict
  },

  watch: {
    chokidar,
    clearScreen,
    exclude,
    include
  }
};
```

You can export an **array** from your config file to build bundles from several different unrelated inputs at once, even in watch mode. To build different bundles with the same input, you supply an array of output options for each input:

```javascript
// rollup.config.js (building more than one bundle)

export default [{
  input: 'main-a.js',
  output: {
    file: 'dist/bundle-a.js',
    format: 'cjs'
  }
}, {
  input: 'main-b.js',
  output: [
    {
      file: 'dist/bundle-b1.js',
      format: 'cjs'
    },
    {
      file: 'dist/bundle-b2.js',
      format: 'esm'
    }
  ]
}];
```

If you want to create your config asynchronously, Rollup can also handle a `Promise` which resolves to an object or an array.

```javascript
// rollup.config.js
import fetch from 'node-fetch';
export default fetch('/some-remote-service-or-file-which-returns-actual-config');
```

Similarly, you can do this as well:

```javascript
// rollup.config.js (Promise resolving an array)
export default Promise.all([
  fetch('get-config-1'),
  fetch('get-config-2')
])
```

You *must* use a configuration file in order to do any of the following:

- bundle one project into multiple output files
- use Rollup plugins, such as [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) and [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs) which let you load CommonJS modules from the Node.js ecosystem

To use Rollup with a configuration file, pass the `--config` or `-c` flags.

```console
# use Rollup with a rollup.config.js file
$ rollup --config

# alternatively, specify a custom config file location
$ rollup --config my.config.js
```

You can also export a function that returns any of the above configuration formats. This function will be passed the current command line arguments so that you can dynamically adapt your configuration to respect e.g. [`--silent`](guide/en/#--silent). You can even define your own command line options if you prefix them with `config`:

```javascript
// rollup.config.js
import defaultConfig from './rollup.default.config.js';
import debugConfig from './rollup.debug.config.js';

export default commandLineArgs => {
  if (commandLineArgs.configDebug === true) {
    return debugConfig;
  }
  return defaultConfig;
}
```

If you now run `rollup --config --configDebug`, the debug configuration will be used.


### Command line flags

Many options have command line equivalents. In those cases, any arguments passed here will override the config file, if you're using one. This is a list of all supported options:

```text
-c, --config <filename>     Use this config file (if argument is used but value
                              is unspecified, defaults to rollup.config.js)
-d, --dir <dirname>         Directory for chunks (if absent, prints to stdout)
-e, --external <ids>        Comma-separate list of module IDs to exclude
-f, --format <format>       Type of output (amd, cjs, esm, iife, umd)
-g, --globals <pairs>       Comma-separate list of `moduleID:Global` pairs
-h, --help                  Show this help message
-i, --input <filename>      Input (alternative to <entry file>)
-m, --sourcemap             Generate sourcemap (`-m inline` for inline map)
-n, --name <name>           Name for UMD export
-o, --file <output>         Single output file (if absent, prints to stdout)
-v, --version               Show version number
-w, --watch                 Watch files in bundle and rebuild on changes
--amd.id <id>               ID for AMD module (default is anonymous)
--amd.define <name>         Function to use in place of `define`
--assetFileNames <pattern>  Name pattern for emitted assets
--banner <text>             Code to insert at top of bundle (outside wrapper)
--chunkFileNames <pattern>  Name pattern for emitted secondary chunks
--compact                   Minify wrapper code
--context <variable>        Specify top-level `this` value
--dynamicImportFunction <name>         Rename the dynamic `import()` function
--entryFileNames <pattern>  Name pattern for emitted entry chunks
--environment <values>      Settings passed to config file (see example)
--no-esModule               Do not add __esModule property
--exports <mode>            Specify export mode (auto, default, named, none)
--extend                    Extend global variable defined by --name
--no-externalLiveBindings   Do not generate code to support live bindings
--footer <text>             Code to insert at end of bundle (outside wrapper)
--no-freeze                 Do not freeze namespace objects
--no-indent                 Don't indent result
--no-interop                Do not include interop block
--inlineDynamicImports      Create single bundle when using dynamic imports
--intro <text>              Code to insert at top of bundle (inside wrapper)
--namespaceToStringTag      Create proper `.toString` methods for namespaces
--noConflict                Generate a noConflict method for UMD globals
--no-strict                 Don't emit `"use strict";` in the generated modules
--outro <text>              Code to insert at end of bundle (inside wrapper)
--preferConst               Use `const` instead of `var` for exports
--preserveModules           Preserve module structure
--preserveSymlinks          Do not follow symlinks when resolving files
--shimMissingExports        Create shim variables for missing exports
--silent                    Don't print warnings
--sourcemapExcludeSources   Do not include source code in source maps
--sourcemapFile <file>      Specify bundle position for source maps
--strictDeprecations        Throw errors for deprecated features
--no-treeshake              Disable tree-shaking optimisations
--no-treeshake.annotations  Ignore pure call annotations
--no-treeshake.propertyReadSideEffects Ignore property access side-effects
--treeshake.pureExternalModules        Assume side-effect free externals
```

The flags listed below are only available via the command line interface. All other flags correspond to and override their config file equivalents, see the [big list of options](guide/en/#big-list-of-options) for details.

#### `-h`/`--help`

Print the help document.

#### `-v`/`--version`

Print the installed version number.

#### `-w`/`--watch`

Rebuild the bundle when its source files change on disk.

_Note: Alternatively, the `ROLLUP_WATCH` environment variable may be set to `true` to enable watch mode._

#### `--silent`

Don't print warnings to the console. If your configuration file contains an `onwarn` handler, this handler will still be called. To manually prevent that, you can access the command line options in your configuration file as described at the end of [Configuration Files](guide/en/#configuration-files).

#### `--environment <values>`

Pass additional settings to the config file via `process.ENV`.

```sh
rollup -c --environment INCLUDE_DEPS,BUILD:production
```

will set `process.env.INCLUDE_DEPS === 'true'` and `process.env.BUILD === 'production'`. You can use this option several times. In that case, subsequently set variables will overwrite previous definitions. This enables you for instance to overwrite environment variables in `package.json` scripts:

```json
// in package.json
{
  "scripts": {
    "build": "rollup -c --environment INCLUDE_DEPS,BUILD:production"
  }
}
```

If you call this script via:

```console
npm run build -- --environment BUILD:development
```

then the config file will receive `process.env.INCLUDE_DEPS === 'true'` and `process.env.BUILD === 'development'`.
