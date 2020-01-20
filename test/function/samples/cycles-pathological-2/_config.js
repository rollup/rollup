module.exports = {
	description: 'resolves even more pathological cyclical dependencies gracefully',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['main.js', 'b.js', 'main.js'],
			importer: 'main.js',
			message: 'Circular dependency: main.js -> b.js -> main.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['b.js', 'd.js', 'c.js', 'b.js'],
			importer: 'b.js',
			message: 'Circular dependency: b.js -> d.js -> c.js -> b.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['main.js', 'b.js', 'd.js', 'c.js', 'main.js'],
			importer: 'main.js',
			message: 'Circular dependency: main.js -> b.js -> d.js -> c.js -> main.js'
		}
	]
};
