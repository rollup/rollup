const assert = require('node:assert');

module.exports = defineTest({
	description: 'exports are rewritten inside a variable init',
	exports: exports => {
		assert.equal(exports.b, 42);
	}
});
