const assert = require('assert');

module.exports = {
	description: 'correct statement order is preserved even in weird edge cases',
	context: {
		getAnswer(obj) {
			return obj.answer;
		}
	},
	exports(exports) {
		assert.equal(exports, 'right');
	}
};
