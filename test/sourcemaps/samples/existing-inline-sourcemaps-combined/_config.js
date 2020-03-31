const assert = require('assert');

module.exports = {
	solo: true,
	description: 'removes existing inline sourcemaps',
	async test(code) {
		assert.strictEqual(code.indexOf('sourceMappingURL'), -1);
	}
};
