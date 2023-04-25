const assert = require('node:assert');

module.exports = defineTest({
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
				name: 'test',
				renderStart(options) {
					assert.strictEqual(options.generatedCode.arrowFunctions, false);
					assert.strictEqual(options.generatedCode.objectShorthand, false);
					assert.strictEqual(options.generatedCode.reservedNamesAsProps, true);
				}
			}
		]
	}
});
