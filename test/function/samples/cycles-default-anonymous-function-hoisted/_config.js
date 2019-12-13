module.exports = {
	description: 'Anonymous function declarations are hoisted',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['f.js', 'g.js', 'f.js'],
			importer: 'f.js',
			message: 'Circular dependency: f.js -> g.js -> f.js'
		}
	]
};
