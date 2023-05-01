const assert = require('node:assert');

module.exports = defineTest({
	description: 'do not deconflict break label (#2773)',
	exports(exports) {
		assert.deepStrictEqual(exports, { value: 'original', n: 1 });
	}
});
