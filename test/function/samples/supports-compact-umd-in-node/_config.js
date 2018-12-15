const assert = require('assert');

module.exports = {
	description: 'umd output works in node',
	options: {
		output: { format: 'umd', name: 'bundle', compact: true }
	},
	exports(exports) {
		assert.equal(exports.x, 'y');
	}
};
