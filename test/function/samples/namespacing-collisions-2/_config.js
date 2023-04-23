const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'correctly namespaces when using * exports, take two (#910)',
	exports(exports) {
		assert.deepEqual(exports, ['Material', 'MaterialAgain', 'Something', 'SomethingAgain']);
	}
});
