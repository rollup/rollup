const assert = require('node:assert');

const Math = {};

module.exports = defineTest({
	description: 'side-effects to assumed globals are included',
	context: {
		Math
	},
	exports() {
		assert.equal(Math.square(3), 9);
		assert.equal(Math.cube(3), 27);
	}
});
