const assert = require('assert');

module.exports = {
	description: 'correctly namespaces sub-functions (#910)',
	exports(exports) {
		assert.equal(exports, 'foobar');
	}
};
