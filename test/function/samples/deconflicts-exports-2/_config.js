const assert = require('assert');

module.exports = {
	description: 'renames nested variables named "exports" if necessary',
	exports(exports) {
		assert.equal(exports.x, 2);
	}
};
