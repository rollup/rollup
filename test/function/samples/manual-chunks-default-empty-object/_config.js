const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'disables onlyExplicitManualChunks by default for an empty manualChunks object',
	options: {
		output: {
			manualChunks: {}
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
