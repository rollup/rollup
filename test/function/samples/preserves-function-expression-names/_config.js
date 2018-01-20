const assert = require('assert');

module.exports = {
	description: 'does not rewrite function expression names incorrectly (#1083)',
	options: {
		external: ['path']
	},
	exports(exports) {
		assert.ok(!/path/.test(exports.x.name));
		assert.equal(exports.y, 'somefile.txt');
	}
};
