const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'respects an explicit onlyExplicitManualChunks override for the function form',
	options: {
		output: {
			manualChunks() {},
			onlyExplicitManualChunks: false
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
