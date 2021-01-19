module.exports = {
	description: 'handles circular default exports',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['main.js', 'main.js'],
			importer: 'main.js',
			message: 'Circular dependency: main.js -> main.js'
		}
	]
};
