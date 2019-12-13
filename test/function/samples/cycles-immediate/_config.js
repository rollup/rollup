module.exports = {
	description: 'handles cycles where imports are immediately used',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['evens.js', 'odds.js', 'evens.js'],
			importer: 'evens.js',
			message: 'Circular dependency: evens.js -> odds.js -> evens.js'
		}
	]
};

// Test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/cycles-immediate
