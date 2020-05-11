const assert = require('assert');

module.exports = {
	description: 'Tracks updates of default exported globals',
	exports(exports) {
		assert.deepStrictEqual(exports, { original: 1, updated: 2 });
	}
};
