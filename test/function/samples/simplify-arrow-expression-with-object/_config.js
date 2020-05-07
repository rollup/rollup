const assert = require('assert');

module.exports = {
	description: 'correctly simplifies arrow expressions where the right hand side becomes an object',
	exports(exports) {
		assert.deepStrictEqual(exports.conditional(), { x: 42, y: 43 });
		assert.deepStrictEqual(exports.logical(), { x: 42, y: 43 });
	}
};
