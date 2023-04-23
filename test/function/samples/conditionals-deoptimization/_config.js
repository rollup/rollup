const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles deoptimization of conditionals',
	exports(exports) {
		assert.deepStrictEqual(exports, {
			cond1a: true,
			cond1b: true,
			cond2a: true,
			cond2b: true,
			log1a: true,
			log1b: true,
			log2a: true,
			log2b: true
		});
	}
});
