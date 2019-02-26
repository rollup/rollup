rollup version __VERSION__
=====================================

Usage: rollup [options] <entry file>

Basic options:

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
--entryFileNames <pattern>  Name pattern for emitted entry chunks
--environment <values>      Settings passed to config file (see example)
--no-esModule               Do not add __esModule property
--exports <mode>            Specify export mode (auto, default, named, none)
--extend                    Extend global variable defined by --name
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
--no-treeshake              Disable tree-shaking optimisations
--no-treeshake.annotations  Ignore pure call annotations
--no-treeshake.propertyReadSideEffects Ignore property access side-effects
--treeshake.pureExternalModules        Assume side-effect free externals

Examples:

# use settings in config file
rollup -c

# in config file, process.env.INCLUDE_DEPS === 'true'
# and process.env.BUILD === 'production'
rollup -c --environment INCLUDE_DEPS,BUILD:production

# create CommonJS bundle.js from src/main.js
rollup --format=cjs --file=bundle.js -- src/main.js

# create self-executing IIFE using `window.jQuery`
# and `window._` as external globals
rollup -f iife --globals jquery:jQuery,lodash:_ \
  -i src/app.js -o build/app.js -m build/app.js.map

Notes:

* When piping to stdout, only inline sourcemaps are permitted

For more information visit https://rollupjs.org
