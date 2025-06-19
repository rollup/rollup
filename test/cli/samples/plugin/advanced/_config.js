module.exports = defineTest({
	description: 'advanced CLI --plugin functionality with rollup config',
	spawnArgs: [
		'-c',
		'-p',
		'node-resolve,commonjs',
		'-p',
		'terser={output: {beautify: true, indent_level: 2}}'
	]
});
