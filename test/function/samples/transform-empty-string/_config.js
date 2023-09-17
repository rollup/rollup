const assert = require('node:assert');

const sideEffects = [];

module.exports = defineTest({
	description: 'allows transformers to transform code to an empty string',
	context: { sideEffects },
	exports() {
		assert.deepStrictEqual(sideEffects, ['this happens']);
	},
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform(code, id) {
					if (id.endsWith('transformed.js')) {
						return '';
					}
				}
			}
		]
	}
});
