const assert = require('node:assert');

module.exports = defineTest({
	description: 'includes all paths of exported objects',
	exports(exports) {
		assert.deepStrictEqual(exports, {
			foo: {
				a: 1,
				b: { c: 2 }
			}
		});
	}
});
