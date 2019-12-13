module.exports = {
	description: 'does not stack overflow on crazy cyclical dependencies',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['c.js', 'd.js', 'b.js', 'c.js'],
			importer: 'c.js',
			message: 'Circular dependency: c.js -> d.js -> b.js -> c.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['c.js', 'd.js', 'c.js'],
			importer: 'c.js',
			message: 'Circular dependency: c.js -> d.js -> c.js'
		}
	]
};
