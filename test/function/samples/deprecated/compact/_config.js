module.exports = {
	description: 'compact output with compact: true',
	options: {
		strictDeprecations: false,
		external: ['external'],
		output: {
			compact: true,
			namespaceToStringTag: true
		}
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['main.js', 'main.js'],
			importer: 'main.js',
			message: 'Circular dependency: main.js -> main.js'
		},
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.'
		}
	],
	context: {
		require() {
			return 42;
		}
	}
};
