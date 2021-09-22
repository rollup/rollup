const assert = require('assert');

module.exports = {
	description: 'handles generatedCode preset "es5"',
	options: {
		output: {
			exports: 'named',
			format: 'system',
			generatedCode: 'es5',
			name: 'bundle'
		},
		plugins: [
			{
				renderStart(options) {
					assert.strictEqual(options.generatedCode.arrowFunctions, false);
					assert.strictEqual(options.generatedCode.objectShorthand, false);
					assert.strictEqual(options.generatedCode.reservedNamesAsProps, true);
				}
			}
		]
	}
};
