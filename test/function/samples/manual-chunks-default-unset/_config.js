const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'disables onlyExplicitManualChunks by default when manualChunks is not used',
	options: {
		output: {},
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
