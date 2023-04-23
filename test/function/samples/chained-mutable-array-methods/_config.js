const assert = require('node:assert');

module.exports = defineRollupTest({
	description:
		'recognizes side-effects when applying mutable array methods to chained array methods (#3555)',
	exports(exports) {
		assert.deepStrictEqual(exports.a, ['PASS']);
	}
});
