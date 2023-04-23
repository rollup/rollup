const assert = require('node:assert');

module.exports = defineTest({
	description: 're-exports * from external module (#791)',
	options: {
		external: ['external']
	},
	context: {
		require(id) {
			if (id === 'external') {
				return {
					foo: 1,
					bar: 2
				};
			}
		}
	},
	exports: exports => {
		assert.equal(exports.foo, 1);
		assert.equal(exports.bar, 2);
	}
});
