module.exports = {
	description: 'load an ESM-only rollup plugin from node_modules as well as CJS plugins',
	command: `rollup -c -p node-resolve,commonjs,esm-test -p "terser={mangle: false, output: {beautify: true, indent_level: 2}}"`
};
