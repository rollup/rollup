const assert = require('assert');

module.exports = {
	description: 'removes sourcemap comments',
	async test(code) {
		assert.strictEqual(code.indexOf('sourceMappingURL'), -1);
	}
};
