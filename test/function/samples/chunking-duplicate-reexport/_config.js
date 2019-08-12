const assert = require('assert');

module.exports = {
	description: 'handles duplicate reexports when using dynamic imports',
	exports(exports) {
		return exports.then(result => assert.deepStrictEqual(result, [{ answer: 42 }, { answer: 42 }]));
	}
};
