const assert = require('assert');
const path = require('path');

const mockedValue = {
	val: 'A value'
};

module.exports = {
	description: 'allows a nonexistent relative module to be configured as external',
	options: {
		external: [path.join(__dirname, './nonexistent-relative-dependency.js')]
	},
	context: {
		require() {
			return mockedValue;
		}
	},
	exports() {
		assert.equal(mockedValue.wasAltered, true);
	}
};
