const assert = require('node:assert');

module.exports = defineTest({
	description: 'removes existing inline sourcemaps',
	async test(code) {
		assert.ok(!code.includes('sourceMappingURL=data'));
	}
});
