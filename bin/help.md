rollup version <%= version %>
=====================================

Usage: rollup [options] <entry file>

Basic options:

-v, --version            Show version number
-h, --help               Show this help message
-c, --config             Use this config file (if argument is used but value
                           is unspecified, defaults to rollup.config.js)
-i, --input              Input (alternative to <entry file>)
-o, --output <output>    Output (if absent, prints to stdout)
-f, --format [es6]       Type of output (amd, cjs, es6, iife, umd)
-e, --external           Comma-separate list of module IDs to exclude
-g, --globals            Comma-separate list of `module ID:Global` pairs
                            Any module IDs defined here are added to external
-n, --name               Name for UMD export
-u, --id                 ID for AMD module (default is anonymous)
-m, --sourcemap          Generate sourcemap (`-m inline` for inline map)
--no-strict              Don't emit a `"use strict";` in the generated modules.
--no-indent              Don't indent result
--environment <values>   Settings passed to config file (see example)
--intro                  Content to insert at top of bundle (inside wrapper)
--outro                  Content to insert at end of bundle (inside wrapper)
--banner                 Content to insert at top of bundle (outside wrapper)
--footer                 Content to insert at end of bundle (outside wrapper)

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
