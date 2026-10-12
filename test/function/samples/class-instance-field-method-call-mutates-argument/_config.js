const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'tracks mutations by methods called from instance field initializers',
	exports({ Service, getStatus }) {
		assert.strictEqual(getStatus(), 'disabled');
		new Service();
		assert.strictEqual(getStatus(), 'enabled');
	}
});
