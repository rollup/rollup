const assert = require('node:assert');

module.exports = defineTest({
	description: 'correctly imports the default from an entry point',
	options: {
		input: ['main', 'dep']
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			value: 42
		});
	}
});
