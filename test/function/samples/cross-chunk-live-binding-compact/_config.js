const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles cross-chunk live-bindings in compact mode',
	options: {
		input: ['main.js', 'named.js', 'star.js'],
		output: {
			compact: true
		}
	},
	exports(exports) {
		assert.equal(exports.named, 0, 'named');
		exports.incrementNamed();
		assert.equal(exports.named, 1, 'named');

		assert.equal(exports.star, 0, 'star');
		exports.incrementStar();
		assert.equal(exports.star, 1, 'star');
	}
});
