const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'keeps namespace reexports from external ids starting with "*" apart from exports with the same name',
	options: {
		external: ['*external']
	},
	context: {
		require(id) {
			if (id === '*external') {
				return { '*external': 'external', foo: 'foo' };
			}
		}
	},
	exports(exports) {
		assert.equal(exports['*external'], 'local');
		assert.equal(exports.foo, 'foo');
	}
});
