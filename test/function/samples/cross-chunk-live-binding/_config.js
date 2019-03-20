const assert = require('assert');

// TODO Lukas always use exports.foo unless id
module.exports = {
	description: 'handles cross-chunk live-bindings',
	options: {
		input: ['main.js', 'named.js', 'star.js']
	},
	exports(exports) {
		assert.equal(exports.named, 0, 'named');
		exports.incrementNamed();
		assert.equal(exports.named, 1, 'named');
		assert.equal(exports.star, 0, 'star');
		exports.incrementStar();
		assert.equal(exports.star, 1, 'star');
	}
};
