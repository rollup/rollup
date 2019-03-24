const assert = require('assert');

module.exports = {
	description: 'do not deconflict break label (#2773)',
	exports(exports) {
		assert.deepStrictEqual(exports, { value: 'original', n: 1 });
	}
};
