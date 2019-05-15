const assert = require('assert');
const sideEffects = [];

module.exports = {
	description: 'handles reexporting values when module side-effects are false',
	context: {
		sideEffects
	},
	exports() {
		assert.deepStrictEqual(sideEffects, ['dep1']);
	},
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	}
};
