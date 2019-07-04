const assert = require('assert');

module.exports = {
	description: 'allows catching failed dynamic imports',
	options: {
		input: ['main', 'exists-default'],
		external: ['does-not-exist']
	},
	exports(exports) {
		return exports.then(result => {
			assert.strictEqual(result[0].message, 'exists-named');
			assert.strictEqual(result[1].message, 'exists-default');
			const expectedError = "Cannot find module 'does-not-exist'";
			assert.strictEqual(result[2].message.slice(0, expectedError.length), expectedError);
		});
	}
};
