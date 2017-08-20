rollup version __VERSION__
=====================================

Usage: rollup [options] <entry file>

Basic options:

-v, --version               Show version number
-h, --help                  Show this help message
-c, --config                Use this config file (if argument is used but value
                              is unspecified, defaults to rollup.config.js)
-w, --watch                 Watch files in bundle and rebuild on changes
-i, --input                 Input (alternative to <entry file>)
-o, --output.file <output>  Output (if absent, prints to stdout)
-f, --output.format [es]    Type of output (amd, cjs, es, iife, umd)
-e, --external              Comma-separate list of module IDs to exclude
-g, --globals               Comma-separate list of `module ID:Global` pairs
                              Any module IDs defined here are added to external
-n, --name                  Name for UMD export
-m, --sourcemap             Generate sourcemap (`-m inline` for inline map)
--amd.id                    ID for AMD module (default is anonymous)
--amd.define                Function to use in place of `define`
--no-strict                 Don't emit a `"use strict";` in the generated modules.
--no-indent                 Don't indent result
--environment <values>      Settings passed to config file (see example)
--no-conflict               Generate a noConflict method for UMD globals
--silent                    Don't print warnings
--intro                     Content to insert at top of bundle (inside wrapper)
--outro                     Content to insert at end of bundle (inside wrapper)
--banner                    Content to insert at top of bundle (outside wrapper)
--footer                    Content to insert at end of bundle (outside wrapper)
--interop                   Include interop block (true by default)

Examples:

# use settings in config file
rollup -c

# in config file, process.env.INCLUDE_DEPS === 'true'
# and process.env.BUILD === 'production'
rollup -c --environment INCLUDE_DEPS,BUILD:production

# create CommonJS bundle.js from src/main.js
rollup --format=cjs --output=bundle.js -- src/main.js

# create self-executing IIFE using `window.jQuery`
# and `window._` as external globals
rollup -f iife --globals jquery:jQuery,lodash:_ \
  -i src/app.js -o build/app.js -m build/app.js.map

Notes:

* When piping to stdout, only inline sourcemaps are permitted

For more information visit https://github.com/rollup/rollup/wiki
