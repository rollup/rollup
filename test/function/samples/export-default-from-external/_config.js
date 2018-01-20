var path = require('path');
var assert = require('assert');

module.exports = {
	description: 'ensures external modules have correct names',
	options: {
		external: ['path']
	},
	exports: function(exports) {
		assert.equal(exports, path.sep);
	}
};
