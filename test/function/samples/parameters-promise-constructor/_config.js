const assert = require('assert');

module.exports = defineTest({
	description: 'correctly handles parameters of promise constructor',
	async exports({ result }) {
		assert.strictEqual(await result, 42);
	}
});
