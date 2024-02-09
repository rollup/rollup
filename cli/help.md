rollup version __VERSION__
=====================================

Usage: rollup [options] <entry file>

Basic options:

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
--no-sanitizeFileName       Do not replace invalid characters in file names
--shimMissingExports        Create shim variables for missing exports
--silent                    Don't print warnings
--sourcemapBaseUrl <url>    Emit absolute sourcemap URLs with given base
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
