var assert = require('assert');

module.exports = {
	description: 'cycles work with default exports',
	options: {
		ignoreWarnings: ['UNRESOLVED_IMPORT', 'CIRCULAR_DEPENDENCY'],
	},
	warnings: [],
	runtimeError: function(error) {
		assert.equal("Cannot find module 'unlessYouCreatedThisFileForSomeReason'", error.message);
	}
};
