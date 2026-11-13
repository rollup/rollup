const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'renders conditional multi-declarator exported var declarations in CommonJS output',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.ifA, 1);
		assert.equal(exports.ifB, 2);
		assert.equal(exports.elseA, 3);
		assert.equal(exports.elseB, 4);
		assert.equal(exports.patternA, 5);
		assert.equal(exports.noInitA, undefined);
		assert.equal(exports.noInitB, 6);
		assert.equal(exports.labelA, 1);
		assert.equal(exports.labelB, 2);
		assert.equal(exports.deadBranch, 1);
	}
});
