var assert = require('assert');
var path = require('path');

var mockedValue = {
	val: 'A value'
};

module.exports = {
	description: 'allows a nonexistent relative module to be configured as external',
	options: {
		external: [path.join(__dirname, './nonexistent-relative-dependency.js')]
	},
	context: {
		require: function() {
			return mockedValue;
		}
	},
	exports: function() {
		assert.equal(mockedValue.wasAltered, true);
	}
};
