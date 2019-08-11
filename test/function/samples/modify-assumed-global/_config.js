const assert = require('assert');

const Math = {};

module.exports = {
	description: 'side-effects to assumed globals are included',
	context: {
		Math
	},
	exports(exports) {
		assert.equal(Math.square(3), 9);
		assert.equal(Math.cube(3), 27);
	}
};
