const assert = require('node:assert');

module.exports = defineTest({
	description: 'includes necessary dynamic import properties in try-catch',
	async exports({ test }) {
		assert.equal(await test(), 'OK');
	}
});
