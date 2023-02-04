const assert = require('node:assert');

module.exports = {
	description: 'removes sourcemap comments',
	async test(code) {
		assert.ok(!code.includes('sourceMappingURL=main.js.map'));
	}
};
