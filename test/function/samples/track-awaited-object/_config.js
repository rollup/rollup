const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'tracks object mutations through await',
	async exports(exports) {
		assert.strictEqual(exports.toggled, false);
		await exports.test();
		assert.strictEqual(exports.toggled, true);
	}
});
