---
title: Command Line Interface
---

Rollup should typically be used from the command line. You can provide an optional Rollup configuration file to simplify command line usage and enable advanced Rollup functionality.

### Configuration Files

Rollup configuration files are optional, but they are powerful and convenient and thus **recommended**. A config file is an ES module that exports a default object with the desired options:

```javascript
export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
};
```

Typically, it is called `rollup.config.js` and sits in the root directory of your project. Behind the scenes, Rollup will usually transpile and bundle this file and its relative dependencies to CommonJS before requiring it. This has the advantage that you can share code with an ES module code base while having full interoperability with the Node ecosystem.

If you want to write your config as a CommonJS module using `require` and `module.exports`, you should change the file extension to `.cjs`, which will prevent Rollup from trying to transpile the file. Furthermore if you are on Node 13+, changing the file extension to `.mjs` will also prevent Rollup from transpiling it but import the file as an ES module instead. See [using untranspiled config files](guide/en/#using-untranspiled-config-files) for more details and why you might want to do this.

You can also use other languages for your configuration files like TypeScript. To do that, install a corresponding Rollup plugin like `@rollup/plugin-typescript` and use the [`--configPlugin`](guide/en/#--configplugin-plugin) option:

```
rollup --config rollup.config.ts --configPlugin typescript
```

Also have a look at [Config Intellisense](guide/en/#config-intellisense) for more ways to use TypeScript typings in your config files.

Config files support the options listed below. Consult the [big list of options](guide/en/#big-list-of-options) for details on each option:

```javascript
// rollup.config.js

// can be an array (for multiple inputs)
export default {
  // core input options
  external,
  input, // conditionally required
  plugins,

  // advanced input options
  cache,
  onwarn,
  preserveEntrySignatures,
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
  experimentalCacheExpiry,
  perf,

  // required (can be an array, for multiple outputs)
  output: {
    // core output options
    dir,
    file,
    format, // required
    globals,
    name,
    plugins,

    // advanced output options
    assetFileNames,
    banner,
    chunkFileNames,
    compact,
    entryFileNames,
    extend,
    footer,
    hoistTransitiveImports,
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
    sourcemapExcludeSources,
    sourcemapFile,
    sourcemapPathTransform,
    validate,

    // danger zone
    amd,
    esModule,
    exports,
    externalLiveBindings,
    freeze,
    indent,
    namespaceToStringTag,
    noConflict,
    preferConst,
    sanitizeFileName,
    strict,
    systemNullSetters
  },

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

You can export an **array** from your config file to build bundles from several unrelated inputs at once, even in watch mode. To build different bundles with the same input, you supply an array of output options for each input:

```javascript
// rollup.config.js (building more than one bundle)

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
export default fetch('/some-remote-service-or-file-which-returns-actual-config');
```

Similarly, you can do this as well:

```javascript
// rollup.config.js (Promise resolving an array)
export default Promise.all([fetch('get-config-1'), fetch('get-config-2')]);
```

To use Rollup with a configuration file, pass the `--config` or `-c` flags:

```
# pass a custom config file location to Rollup
rollup --config my.config.js

# if you do not pass a file name, Rollup will try to load
# configuration files in the following order:
# rollup.config.mjs -> rollup.config.cjs -> rollup.config.js
rollup --config
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
};
```

If you now run `rollup --config --configDebug`, the debug configuration will be used.

By default, command line arguments will always override the respective values exported from a config file. If you want to change this behaviour, you can make Rollup ignore command line arguments by deleting them from the `commandLineArgs` object:

```javascript
// rollup.config.js
export default commandLineArgs => {
  const inputBase = commandLineArgs.input || 'main.js';

  // this will make Rollup ignore the CLI argument
  delete commandLineArgs.input;
  return {
    input: 'src/entries/' + inputBase,
    output: {...}
  }
}
```

#### Config Intellisense

Since Rollup ships with TypeScript typings, you can leverage your IDE's Intellisense with JSDoc type hints:

```javascript
// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  // ...
};

export default config;
```

Alternatively you can use the `defineConfig` helper, which should provide Intellisense without the need for JSDoc annotations:

```javascript
// rollup.config.js
import { defineConfig } from 'rollup';

export default defineConfig({
  // ...
});
```

Besides `RollupOptions` and the `defineConfig` helper that encapsulates this type, the following types can prove useful as well:

- `OutputOptions`: The `output` part of a config file
- `Plugin`: A plugin object that provides a `name` and some hooks. All hooks are fully typed to aid in plugin development.
- `PluginImpl`: A function that maps an options object to a plugin object. Most public Rollup plugins follow this pattern.

You can also directly write your config in TypeScript via the [`--configPlugin`](guide/en/#--configplugin-plugin) option.

### Differences to the JavaScript API

While config files provide an easy way to configure Rollup, they also limit how Rollup can be invoked and configured. Especially if you are bundling Rollup into another build tool or want to integrate it into an advanced build process, it may be better to directly invoke Rollup programmatically from your scripts.

If you want to switch from config files to using the [JavaScript API](guide/en/#javascript-api) at some point, there are some important differences to be aware of:

- When using the JavaScript API, the configuration passed to `rollup.rollup` must be an object and cannot be wrapped in a Promise or a function.
- You can no longer use an array of configurations. Instead, you should run `rollup.rollup` once for each set of `inputOptions`.
- The `output` option will be ignored. Instead, you should run `bundle.generate(outputOptions)` or `bundle.write(outputOptions)` once for each set of `outputOptions`.

### Loading a configuration from a Node package

For interoperability, Rollup also supports loading configuration files from packages installed into `node_modules`:

```
# this will first try to load the package "rollup-config-my-special-config";
# if that fails, it will then try to load "my-special-config"
rollup --config node:my-special-config
```

### Using untranspiled config files

By default, Rollup will expect config files to be ES modules and bundle and transpile them and their relative imports to CommonJS before requiring them. This is a fast process and has the advantage that it is easy to share code between your configuration and an ES module code base. If you want to write your configuration as CommonJS instead, you can skip this process by using the `.cjs` extension:

```javascript
// rollup.config.cjs
module.exports = {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
};
```

It may be pertinent if you want to use the config file not only from the command line, but also from your custom scripts programmatically.

On the other hand if you are using at least Node 13 and have `"type": "module"` in your `package.json` file, Rollup's transpilation will prevent your configuration file from importing packages that are themselves ES modules. In that case, changing your file extension to `.mjs` will instruct Rollup to import your configuration directly as an ES module. However, note that this is specific to Node 13+; on older Node versions, `.mjs` is treated just like `.js`.

There are some potential gotchas when using `.mjs` on Node 13+:

- You will only get a default export from CommonJS plugins
- You may not be able to import JSON files such as your `package.json file`. There are two ways to go around this:

  - run Rollup CLI via

    ```
    node --experimental-json-modules ./node_modules/.bin/rollup --config
    ```

  - create a CommonJS wrapper that requires the JSON file:

    ```js
    // load-package.cjs
    module.exports = require('./package.json');

    // rollup.config.mjs
    import pkg from './load-package.cjs';
    ...
    ```

### Command line flags

Many options have command line equivalents. In those cases, any arguments passed here will override the config file, if you're using one. This is a list of all supported options:

```text
-c, --config <filename>     Use this config file (if argument is used but value
                              is unspecified, defaults to rollup.config.js)
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
--amd.id <id>               ID for AMD module (default is anonymous)
--amd.autoId                Generate the AMD ID based off the chunk name
--amd.basePath <prefix>     Path to prepend to auto generated AMD ID
--amd.define <name>         Function to use in place of `define`
--assetFileNames <pattern>  Name pattern for emitted assets
--banner <text>             Code to insert at top of bundle (outside wrapper)
--chunkFileNames <pattern>  Name pattern for emitted secondary chunks
--compact                   Minify wrapper code
--context <variable>        Specify top-level `this` value
--entryFileNames <pattern>  Name pattern for emitted entry chunks
--environment <values>      Settings passed to config file (see example)
--no-esModule               Do not add __esModule property
--exports <mode>            Specify export mode (auto, default, named, none)
--extend                    Extend global variable defined by --name
--no-externalLiveBindings   Do not generate code to support live bindings
--failAfterWarnings         Exit with an error if the build produced warnings
--footer <text>             Code to insert at end of bundle (outside wrapper)
--no-freeze                 Do not freeze namespace objects
--no-hoistTransitiveImports Do not hoist transitive imports into entry chunks
--no-indent                 Don't indent result
--no-interop                Do not include interop block
--inlineDynamicImports      Create single bundle when using dynamic imports
--intro <text>              Code to insert at top of bundle (inside wrapper)
--minifyInternalExports     Force or disable minification of internal exports
--namespaceToStringTag      Create proper `.toString` methods for namespaces
--noConflict                Generate a noConflict method for UMD globals
--outro <text>              Code to insert at end of bundle (inside wrapper)
--preferConst               Use `const` instead of `var` for exports
--no-preserveEntrySignatures Avoid facade chunks for entry points
--preserveModules           Preserve module structure
--preserveModulesRoot       Put preserved modules under this path at root level
--preserveSymlinks          Do not follow symlinks when resolving files
--no-sanitizeFileName       Do not replace invalid characters in file names
--shimMissingExports        Create shim variables for missing exports
--silent                    Don't print warnings
--sourcemapExcludeSources   Do not include source code in source maps
--sourcemapFile <file>      Specify bundle position for source maps
--stdin=ext                 Specify file extension used for stdin input
--no-stdin                  Do not read "-" from stdin
--no-strict                 Don't emit `"use strict";` in the generated modules
--strictDeprecations        Throw errors for deprecated features
--systemNullSetters         Replace empty SystemJS setters with `null`
--no-treeshake              Disable tree-shaking optimisations
--no-treeshake.annotations  Ignore pure call annotations
--no-treeshake.moduleSideEffects Assume modules have no side-effects
--no-treeshake.propertyReadSideEffects Ignore property access side-effects
--no-treeshake.tryCatchDeoptimization Do not turn off try-catch-tree-shaking
--no-treeshake.unknownGlobalSideEffects Assume unknown globals do not throw
--waitForBundleInput        Wait for bundle input files
--watch.buildDelay <number> Throttle watch rebuilds
--no-watch.clearScreen      Do not clear the screen when rebuilding
--watch.skipWrite           Do not write files to disk when watching
--watch.exclude <files>     Exclude files from being watched
--watch.include <files>     Limit watching to specified files
--validate                  Validate output
```

The flags listed below are only available via the command line interface. All other flags correspond to and override their config file equivalents, see the [big list of options](guide/en/#big-list-of-options) for details.

#### `-h`/`--help`

Print the help document.

#### `-p <plugin>`, `--plugin <plugin>`

Use the specified plugin. There are several ways to specify plugins here:

- Via a relative path:

  ```
  rollup -i input.js -f es -p ./my-plugin.js
  ```

  The file should export a function returning a plugin object.

- Via the name of a plugin that is installed in a local or global `node_modules` folder:

  ```
  rollup -i input.js -f es -p @rollup/plugin-node-resolve
  ```

  If the plugin name does not start with `rollup-plugin-` or `@rollup/plugin-`, Rollup will automatically try adding these prefixes:

  ```
  rollup -i input.js -f es -p node-resolve
  ```

- Via an inline implementation:

  ```
  rollup -i input.js -f es -p '{transform: (c, i) => `/* ${JSON.stringify(i)} */\n${c}`}'
  ```

If you want to load more than one plugin, you can repeat the option or supply a comma-separated list of names:

```
rollup -i input.js -f es -p node-resolve -p commonjs,json
```

By default, plugin functions will be called with no argument to create the plugin. You can however pass a custom argument as well:

```
rollup -i input.js -f es -p 'terser={output: {beautify: true, indent_level: 2}}'
```

#### `--configPlugin <plugin>`

Allows specifying Rollup plugins to transpile or otherwise control the parsing of your configuration file. The main benefit is that it allows you to use non-JavaScript configuration files. For instance the following will allow you to write your configuration in TypeScript, provided you have `@rollup/plugin-typescript` installed:

```
rollup --config rollup.config.ts --configPlugin @rollup/plugin-typescript
```

It supports the same syntax as the [`--plugin`](guide/en/#-p-plugin---plugin-plugin) option i.e., you can specify the option multiple times, you can omit the `@rollup/plugin-` prefix and just write `typescript` and you can specify plugin options via `={...}`.

#### `-v`/`--version`

Print the installed version number.

#### `-w`/`--watch`

Rebuild the bundle when its source files change on disk.

_Note: While in watch mode, the `ROLLUP_WATCH` environment variable will be set to `"true"` by Rollup's command line interface and can be checked by other processes. Plugins should instead check [`this.meta.watchMode`](guide/en/#thismeta), which is independent of the command line interface._

#### `--silent`

Don't print warnings to the console. If your configuration file contains an `onwarn` handler, this handler will still be called. To manually prevent that, you can access the command line options in your configuration file as described at the end of [Configuration Files](guide/en/#configuration-files).

#### `--failAfterWarnings`

Exit the build with an error if any warnings occurred, once the build is complete.

#### `--environment <values>`

Pass additional settings to the config file via `process.ENV`.

```sh
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

```
npm run build -- --environment BUILD:development
```

then the config file will receive `process.env.INCLUDE_DEPS === 'true'` and `process.env.BUILD === 'development'`.

#### `--waitForBundleInput`

This will not throw an error if one of the entry point files is not available. Instead, it will wait until all files are present before starting the build. This is useful, especially in watch mode, when Rollup is consuming the output of another process.

#### `--stdin=ext`

Specify a virtual file extension when reading content from stdin. By default, Rollup will use the virtual file name `-` without an extension for content read from stdin. Some plugins, however, rely on file extensions to determine if they should process a file. See also [Reading a file from stdin](guide/en/#reading-a-file-from-stdin).

#### `--no-stdin`

Do not read files from `stdin`. Setting this flag will prevent piping content to Rollup and make sure Rollup interprets `-` and `-.[ext]` as a regular file names instead of interpreting these as the name of `stdin`. See also [Reading a file from stdin](guide/en/#reading-a-file-from-stdin).

### Reading a file from stdin

When using the command line interface, Rollup can also read content from stdin:

```
echo "export const foo = 42;" | rollup --format cjs --file out.js
```

When this file contains imports, Rollup will try to resolve them relative to the current working directory. When using a config file, Rollup will only use `stdin` as an entry point if the file name of the entry point is `-`. To read a non-entry-point file from stdin, just call it `-`, which is the file name that is used internally to reference `stdin`. I.e.

```js
import foo from '-';
```

in any file will prompt Rollup to try to read the imported file from `stdin` and assign the default export to `foo`. You can pass the [`--no-stdin`](guide/en/#--no-stdin) CLI flag to Rollup to treat `-` as a regular file name instead.

As some plugins rely on file extensions to process files, you can specify a file extension for stdin via `--stdin=ext` where `ext` is the desired extension. In that case, the virtual file name will be `-.ext`:

```
echo '{"foo": 42, "bar": "ok"}' | rollup --stdin=json -p json
```

The JavaScript API will always treat `-` and `-.ext` as regular file names.
