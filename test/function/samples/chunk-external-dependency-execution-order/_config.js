const assert = require('assert');
const executionOrder = [];

module.exports = {
	description:
		'Uses correct execution order when several modules in a chunk have external dependencies',
	context: {
		executionOrder,
		require(id) {
			executionOrder.push(id);
			return {};
		}
	},
	options: {
		external: ['external-first', 'external-second']
	},
	exports() {
		assert.deepStrictEqual(executionOrder, ['external-first', 'external-second', 'dep', 'main']);
	}
};
