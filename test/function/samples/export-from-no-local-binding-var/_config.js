var assert = require('assert');

module.exports = {
	description: 'export from does not create a local binding',
	runtimeError: function(err) {
		assert.ok(/foo is not defined/.test(err.message));
	}
};
