module.exports = {
	description: 'compact output with compact: true',
	options: {
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
		}
	],
	context: {
		require() {
			return 42;
		}
	}
};
