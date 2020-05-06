const assert = require('assert');

module.exports = {
	description: 'properly resolves inlined dynamic namespaces in compact mode',
	options: { output: { compact: true } },
	exports(exports) {
		return exports.then(result => assert.strictEqual(result, 42 * 3));
	}
};
