const assert = require('node:assert');

module.exports = {
	description: 'avoid using export.hasOwnProperty',
	options: {
		input: './main.js',
		external: ['external'],
		output: {
			paths: {
				external: `${__dirname}/external.js`
			},
			format: 'cjs'
		}
	},
	exports(exports) {
		assert.strictEqual(exports.hasOwnProperty, null);
		assert.strictEqual(exports.name, null);
		assert.strictEqual(
			typeof Object.getOwnPropertyDescriptor(exports, 'hasOwnProperty').get,
			'function'
		);
		assert.strictEqual(typeof Object.getOwnPropertyDescriptor(exports, 'name').get, 'function');
	}
};
