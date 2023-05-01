const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows catching failed dynamic imports',
	options: {
		input: ['main', 'exists-default'],
		external: ['does-not-exist']
	},
	exports(exports) {
		return exports.then(result => {
			assert.strictEqual(result[0].message, 'exists-named');
			assert.strictEqual(result[1].message, 'exists-default');
			const expectedError = "Cannot find package 'does-not-exist'";
			assert.strictEqual(result[2].message.slice(0, expectedError.length), expectedError);
		});
	}
});
