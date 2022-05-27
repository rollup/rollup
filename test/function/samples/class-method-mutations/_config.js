const assert = require('assert');

module.exports = {
	description: 'includes variable mutations in class methods if tree-shaking is disabled',
	options: {
		treeshake: false
	},
	async exports({ promise }) {
		assert.strictEqual(await promise, 'ok');
	}
};
