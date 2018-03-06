var assert = require('assert');

module.exports = {
	description: 'correctly namespaces sub-functions (#910)',
	exports: function(exports) {
		assert.equal(exports, 'foobar');
	}
};
