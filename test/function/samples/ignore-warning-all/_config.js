var assert = require('assert');

module.exports = {
	description: 'cycles work with default exports',
	options: {
		ignoreWarnings: true,
	},
	warnings: [],
	runtimeError: function(error) {
		assert.equal("Cannot find module 'unlessYouCreatedThisFileForSomeReason'", error.message);
	}
};
