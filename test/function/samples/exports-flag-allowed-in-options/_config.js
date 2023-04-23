const assert = require('node:assert');

module.exports = defineTest({
	description: 'exports flag is passed through to bundle options',
	options: {
		output: { exports: 'named' }
	},
	exports(exports) {
		assert.equal(exports.y, 42);
		assert.ok(!('x' in exports));
	}
});
