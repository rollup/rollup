var assert = require('assert');

module.exports = {
	description: "namespace's 'default' properties should be available",

	exports: function(exports) {
		assert.equal(exports, 42);
	}
};
