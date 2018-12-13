const assert = require('assert');

module.exports = {
	description: 'umd output works in node',
	options: {
		output: { format: 'umd', name: 'bundle' }
	},
	exports(exports) {
		assert.equal(exports.x, 'y');
	}
};
