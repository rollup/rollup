const assert = require('node:assert');

module.exports = {
	description: 'exports a default named function',
	exports(exports) {
		assert.equal(exports(), 42);
	}
};
