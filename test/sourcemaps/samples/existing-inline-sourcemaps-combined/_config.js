const assert = require('assert');

module.exports = {
	description: 'removes existing inline sourcemaps',
	async test(code) {
		assert.ok(!code.includes('sourceMappingURL'));
	}
};
