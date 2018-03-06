var assert = require('assert');

module.exports = {
	description: 'resolves even more pathological cyclical dependencies gracefully',
	buble: true,
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'main.js',
			message: 'Circular dependency: main.js -> b.js -> main.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'b.js',
			message: 'Circular dependency: b.js -> d.js -> c.js -> b.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'main.js',
			message: 'Circular dependency: main.js -> b.js -> d.js -> c.js -> main.js'
		}
	]
};
