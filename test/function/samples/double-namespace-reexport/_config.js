const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles chained namespace reexports from externals',
	options: {
		external: 'external'
	},
	context: {
		require(id) {
			assert.strictEqual(id, 'external');
			return { foo: 42 };
		}
	},
	exports({ foo }) {
		assert.strictEqual(foo, 42);
	}
});
