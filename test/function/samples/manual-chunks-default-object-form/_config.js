const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'disables onlyExplicitManualChunks by default for the object form of manualChunks',
	options: {
		output: {
			manualChunks: {
				chunk: ['lib.js']
			}
		},
		plugins: [
			{
				name: 'test-plugin',
				renderStart(outputOptions) {
					assert.strictEqual(outputOptions.onlyExplicitManualChunks, false);
				}
			}
		]
	}
});
