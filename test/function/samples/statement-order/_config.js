const assert = require('node:assert');

module.exports = defineTest({
	description: 'correct statement order is preserved even in weird edge cases',
	context: {
		getAnswer(object) {
			return object.answer;
		}
	},
	exports(exports) {
		assert.equal(exports, 'right');
	}
});
