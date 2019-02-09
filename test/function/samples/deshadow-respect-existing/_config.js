const assert = require('assert');

module.exports = {
	description: 'respect existing variable names when deshadowing',
	exports(exports) {
		assert.equal(exports.getValue(), 'mainmainmainmaindep');
	}
};
