const assert = require('assert');

module.exports = {
	description: 'Tracks updates of default exported globals',
	context: {
		myGlobal: 42
	},
	exports(exports) {
		assert.deepStrictEqual(exports, { original: 42, updated: 1 });
	}
};
