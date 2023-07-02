module.exports = {
	description: 'avoid using export.hasOwnProperty',
	options: {
		input: './main.js',
		output: {
			paths: {
				external: './external.js'
			},
			format: 'cjs'
		}
	},
	exports(exports) {
		assert.strictEqual(exports.hasOwnProperty, false);
		assert.strictEqual(
			typeof Object.getOwnPropertyDescriptor(exports, 'hasOwnProperty').get,
			'function'
		);
	}
};
