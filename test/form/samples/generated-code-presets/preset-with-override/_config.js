const assert = require('node:assert');

module.exports = defineTest({
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
				name: 'test',
				renderStart(options) {
					assert.strictEqual(options.generatedCode.arrowFunctions, false);
					assert.strictEqual(options.generatedCode.objectShorthand, true);
					assert.strictEqual(options.generatedCode.reservedNamesAsProps, true);
				}
			}
		]
	}
});
