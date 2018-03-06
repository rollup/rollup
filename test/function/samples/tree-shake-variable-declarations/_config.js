var assert = require('assert');

module.exports = {
	description: 'remove unused variables from declarations (#1937)',
	exports(exports) {
		assert.deepEqual(exports(), [0.07]);
	}
};
