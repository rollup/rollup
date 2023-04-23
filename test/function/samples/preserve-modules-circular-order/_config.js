const assert = require('node:assert');
const path = require('node:path');
const ID_INDEX = path.join(__dirname, 'index.js');
const ID_DATA = path.join(__dirname, 'data.js');
const ID_TAG = path.join(__dirname, 'tag.js');
const executionOrder = [];

module.exports = defineTest({
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
			ids: [ID_DATA, ID_TAG, ID_DATA],
			message: 'Circular dependency: data.js -> tag.js -> data.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_DATA, ID_TAG, ID_INDEX, ID_DATA],
			message: 'Circular dependency: data.js -> tag.js -> index.js -> data.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_TAG, ID_INDEX, ID_TAG],
			message: 'Circular dependency: tag.js -> index.js -> tag.js'
		}
	]
});
