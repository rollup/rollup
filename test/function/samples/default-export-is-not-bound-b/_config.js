const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not move default export statement above earlier statements',
	exports(exports) {
		assert.equal(exports.bar, 42);
	}
});
