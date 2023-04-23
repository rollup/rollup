const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'correctly namespaces sub-functions (#910)',
	exports(exports) {
		assert.equal(exports, 'foobar');
	}
});
