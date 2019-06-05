const assert = require('assert');

module.exports = {
	description: 'properly handles exporting async functions',
	exports(exports) {
		return exports.callback().then(response => assert.strictEqual(response, 42));
	}
};
