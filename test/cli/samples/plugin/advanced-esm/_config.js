module.exports = defineTest({
	description: 'load an ESM-only rollup plugin from node_modules as well as CJS plugins',
	skipIfWindows: true,

	// The NodeJS resolution rules for ESM modules are more restrictive than CJS.
	// Must copy the ESM plugin into the main node_modules in order to use and test it.

	command: `rm -rf ../../../../../node_modules/rollup-plugin-esm-test && cp -rp ../../../node_modules_rename_me/rollup-plugin-esm-test ../../../../../node_modules/ && rollup -c -p node-resolve,commonjs,esm-test -p "terser={mangle: false, output: {beautify: true, indent_level: 2}}"`
});
