const assert = require('node:assert');

module.exports = {
	description: 'exports default-as-named from sibling module (c)',
	exports(exports) {
		assert.equal(exports.namespace.baz, 'BAZ');
	}
};
