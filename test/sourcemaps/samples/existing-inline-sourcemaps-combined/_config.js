const assert = require('assert');

module.exports = {
	description: 'combines existing sourcemap files into one',
	async test(code) {
		assert.doesNotMatch(code, /sourceMappingURL=data:/);
	},
};
