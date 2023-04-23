const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'allows export and import reference to share name',
	exports(exports) {
		assert.equal(exports.b, 9);
	}
});

// adapted from es6-module-transpiler
