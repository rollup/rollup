const assert = require('assert');

module.exports = {
	description: 'combines existing inline sourcemap comments into one',
	async test(code) {
		assert.doesNotMatch(code, /sourceMappingURL=main\.js\.map/);
		assert.doesNotMatch(code, /sourceMappingURL=other\.js\.map/);
	},
};
