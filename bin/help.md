rollup version <%= version %>
=====================================

Usage: rollup [options] <entry file>

Basic options:

-v, --version            Show version number
-h, --help               Show this help message
-i, --input              Input (alternative to <entry file>)
-o, --output <output>    Output (if absent, prints to stdout)
-f, --format [umd]       Type of output (amd, cjs, es6, iife, umd)
-e, --external           Comma-separate list of module IDs to exclude
-n, --name               Name for UMD export
-u, --id                 ID for AMD module (default is anonymous)
-m, --sourcemap          Generate sourcemap (`-m inline` for inline map)


Example:

rollup --format=cjs --output=bundle.js -- src/main.js


Notes:

* When piping to stdout, only inline sourcemaps are permitted

For more information visit https://github.com/rollup/rollup/wiki
