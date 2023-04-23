const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'avoids name conflicts with local variables named Promise',
	async exports(exports) {
		assert.strictEqual(exports.Promise, 'bar');
		assert.strictEqual((await exports.promised).Promise, 'foo');
	}
});
