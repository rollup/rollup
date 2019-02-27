const assert = require('assert');

module.exports = {
	description: 'correctly imports the default from an entry point',
	options: {
		input: ['main', 'dep']
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			value: 42
		});
	}
};
