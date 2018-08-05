const assert = require('assert');

module.exports = {
	description: 'exports default-as-named from sibling module (c)',
	exports(exports) {
		assert.equal(exports.namespace.baz, 'BAZ');
	}
};
