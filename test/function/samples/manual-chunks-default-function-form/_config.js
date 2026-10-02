const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'enables onlyExplicitManualChunks by default for the function form of manualChunks',
	options: {
		output: {
			manualChunks() {}
		},
		plugins: [
			{
				name: 'test-plugin',
				renderStart(outputOptions) {
					assert.strictEqual(outputOptions.onlyExplicitManualChunks, true);
				}
			}
		]
	}
});
