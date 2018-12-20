---
title: Command Line Interface
---

Rollup should typically be used from the command line. You can provide an  optional Rollup configuration file to simplify command line usage and enable advanced Rollup functionality.

### Configuration Files

Rollup configuration files are optional, but they are powerful and convenient and thus **recommended**.

A config file is an ES6 module that exports a default object with the desired options. Typically, it is called `rollup.config.js` and sits in the root directory of your project.

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

Consult the [big list of options](guide/en#big-list-of-options) for details on each option you can include in your config file.

```javascript
// rollup.config.js

export default { // can be an array (for multiple inputs)
  // core input options
  input,     // required
  external,
  plugins,

  // advanced input options
  onwarn,
  perf,

  // danger zone
  acorn,
  acornInjectPlugins,
  treeshake,
  context,
  moduleContext,

  // experimental
  experimentalCodeSplitting,
  manualChunks,
  experimentalOptimizeChunks,
  chunkGroupingSize,

  output: {  // required (can be an array, for multiple outputs)
    // core output options
    format,  // required
    file,
    dir,
    name,
    globals,

    // advanced output options
    paths,
    banner,
    footer,
    intro,
    outro,
    sourcemap,
    sourcemapFile,
    sourcemapPathTransform,
    interop,
    extend,

    // danger zone
    exports,
    amd,
    indent,
    strict,
    freeze,
    namespaceToStringTag,

    // experimental
    entryFileNames,
    chunkFileNames,
    assetFileNames
  },

  watch: {
    chokidar,
    include,
    exclude,
    clearScreen
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
import fetch from  'node-fetch';
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

You can also export a function that returns any of the above configuration formats. This function will be passed the current command line arguments so that you can dynamically adapt your configuration to respect e.g. `--silent`. You can even define your own command line options if you prefix them with `config`:

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

Many options have command line equivalents. Any arguments passed here will override the config file, if you're using one. See the [big list of options](guide/en#big-list-of-options) for details.

```text
-c, --config                Use this config file (if argument is used but value
                              is unspecified, defaults to rollup.config.js)
-i, --input                 Input (alternative to <entry file>)
-o, --file <output>         Output (if absent, prints to stdout)
-f, --format [esm]          Type of output (amd, cjs, esm, iife, umd)
-e, --external              Comma-separate list of module IDs to exclude
-g, --globals               Comma-separate list of `module ID:Global` pairs
                              Any module IDs defined here are added to external
-n, --name                  Name for UMD export
-m, --sourcemap             Generate sourcemap (`-m inline` for inline map)
--amd.id                    ID for AMD module (default is anonymous)
--amd.define                Function to use in place of `define`
--no-strict                 Don't emit a `"use strict";` in the generated modules.
--no-indent                 Don't indent result
--environment <values>      Environment variables passed to config file
--noConflict                Generate a noConflict method for UMD globals
--no-treeshake              Disable tree-shaking
--intro                     Content to insert at top of bundle (inside wrapper)
--outro                     Content to insert at end of bundle (inside wrapper)
--banner                    Content to insert at top of bundle (outside wrapper)
--footer                    Content to insert at end of bundle (outside wrapper)
--no-interop                Do not include interop block
```

In addition, the following arguments can be used:

#### `-h`/`--help`

Print the help document.

#### `-v`/`--version`

Print the installed version number.

#### `-w`/`--watch`

Rebuild the bundle when its source files change on disk.

#### `--silent`

Don't print warnings to the console.

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
