const assert = require('node:assert');

module.exports = {
	description: 'includes for-loop parameters',
	exports({ checkObject, checkArray }) {
		assert.strictEqual(checkObject({ foo: 1 }), 1, 'object');
		assert.strictEqual(checkArray([2]), 2, 'array');
	}
};
