const assert = require('node:assert/strict');

const decorators = [];

module.exports = defineTest({
	description: 'parses a Decorator',
	walk: {
		Decorator(node) {
			decorators.push(node);
		}
	},
	assertions() {
		assert.deepEqual(decorators, [
			{
				type: 'Decorator',
				start: 0,
				end: 10,
				expression: {
					type: 'Identifier',
					start: 1,
					end: 10,
					name: 'decorator'
				}
			}
		]);
	}
});
