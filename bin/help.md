rollup version <%= version %>
=====================================

Usage: rollup [options] <entry file>

Basic options:

-v, --version            Show version number
-h, --help               Show this help message
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

Examples:

rollup --format=cjs --output=bundle.js -- src/main.js

rollup -f iife --globals jquery:jQuery,angular:ng \
  -i src/app.js -o build/app.js -m build/app.js.map

Notes:

* When piping to stdout, only inline sourcemaps are permitted

For more information visit https://github.com/rollup/rollup/wiki
