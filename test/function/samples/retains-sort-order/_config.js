var assert = require('assert');

module.exports = {
	description: 'sorts statements according to their original order within modules',
	exports: function(exports) {
		assert.equal(exports, 'GREAT SUCCESS');
	}
};
