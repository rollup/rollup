const assert = require('assert');

module.exports = {
	description: 'does not export aliased binding under original name (#438)',
	exports(exports) {
		assert.equal(exports.number, 0);
		assert.equal(exports.incr(), 1);
		assert.equal(exports.number, 1);

		assert.ok(!('count' in exports));
	}
};
