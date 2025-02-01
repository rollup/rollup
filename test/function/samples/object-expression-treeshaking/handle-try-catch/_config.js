const assert = require('node:assert');

module.exports = defineTest({
	description: 'include properties through try-catch calls',
	exports({ getBuilder }) {
		const builder = getBuilder();
		assert.deepStrictEqual(builder.buildCall(), 3n);
		assert.deepStrictEqual(builder.buildEvent(), 2n);
		assert.deepStrictEqual(builder.buildError(), 1n);
	}
});
