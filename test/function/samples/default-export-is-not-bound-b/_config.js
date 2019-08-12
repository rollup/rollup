const assert = require('assert');

module.exports = {
	description: 'does not move default export statement above earlier statements',
	exports(exports) {
		assert.equal(exports.bar, 42);
	}
};
