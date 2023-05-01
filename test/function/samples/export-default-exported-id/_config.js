const assert = require('node:assert');

module.exports = defineTest({
	description: 'exports an id that is also a default export',
	options: {
		output: { exports: 'named' }
	},
	exports(exports) {
		assert.ok(new exports.default().ok);
		assert.ok(new exports.Image().ok);
	}
});
