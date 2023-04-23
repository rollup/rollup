const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles reexporting external values when module side-effects are false',
	context: {
		require(id) {
			return { value: id };
		}
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			external: 'external',
			value: 'externalStar'
		});
	},
	options: {
		external() {
			return true;
		},
		treeshake: {
			moduleSideEffects: false
		}
	}
});
