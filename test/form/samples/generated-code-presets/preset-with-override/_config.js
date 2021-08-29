const assert = require('assert');

module.exports = {
	description: 'handles generatedCode preset "es2015"',
	options: {
		output: {
			exports: 'named',
			format: 'system',
			generatedCode: {
				preset: 'es2015',
				arrowFunctions: false
			},
			name: 'bundle'
		},
		plugins: [
			{
				renderStart(options) {
					assert.strictEqual(options.generatedCode.arrowFunctions, false);
					assert.strictEqual(options.generatedCode.objectShorthand, true);
					assert.strictEqual(options.generatedCode.reservedNamesAsProps, true);
				}
			}
		]
	}
};
