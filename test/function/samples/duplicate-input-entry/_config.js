const assert = require('assert');

module.exports = {
	description: 'handles duplicate entry modules when using the object form',
	options: {
		input: ['entry', 'entry.js']
	},
	exports(exports) {
		assert.deepStrictEqual(exports, { entry: 'main' });
	}
};
