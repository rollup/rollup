var assert = require('assert');

module.exports = {
	description: 'correct statement order is preserved even in weird edge cases',
	context: {
		getAnswer: function(obj) {
			return obj.answer;
		}
	},
	exports: function(exports) {
		assert.equal(exports, 'right');
	}
};
