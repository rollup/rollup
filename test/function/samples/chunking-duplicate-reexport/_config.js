const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles duplicate reexports when using dynamic imports',
	exports(exports) {
		return exports.then(result => assert.deepStrictEqual(result, [{ answer: 42 }, { answer: 42 }]));
	}
});
