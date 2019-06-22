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
			assert.strictEqual(result[2].message, "Cannot find module 'does-not-exist'");
		});
	}
};
