module.exports = {
	description: 'advanced CLI --plugin functionality with rollup config',
	skipIfWindows: true,
	command: `rollup -c -p node-resolve,commonjs -p "terser={output: {beautify: true, indent_level: 2}}"`
};
