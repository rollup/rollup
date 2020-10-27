const assert = require('assert');
const executionOrder = [];

module.exports = {
	description: 'preserves execution order for circular dependencies when preserving modules',
	options: {
		output: { preserveModules: true }
	},
	context: {
		executionOrder
	},
	exports() {
		assert.deepStrictEqual(executionOrder, [
			'index',
			'tag',
			'data',
			'main: Tag: Tag data Tag data'
		]);
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['data.js', 'tag.js', 'data.js'],
			importer: 'data.js',
			message: 'Circular dependency: data.js -> tag.js -> data.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['data.js', 'tag.js', 'index.js', 'data.js'],
			importer: 'data.js',
			message: 'Circular dependency: data.js -> tag.js -> index.js -> data.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['tag.js', 'index.js', 'tag.js'],
			importer: 'tag.js',
			message: 'Circular dependency: tag.js -> index.js -> tag.js'
		}
	]
};
