const assert = require('assert');

module.exports = {
	solo: true,
	description: 'removes sourcemap comments',
	async test(code) {
		assert.strictEqual(code.indexOf('sourceMappingURL'), -1);
	}
};
