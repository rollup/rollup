const assert = require('assert');

module.exports = {
	description: 'tracks object mutations of async arrow function return values',
	async exports(exports) {
		assert.strictEqual(exports.toggled, false);
		await exports.test();
		assert.strictEqual(exports.toggled, true);
	}
};
