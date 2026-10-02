const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'respects an explicit onlyExplicitManualChunks override for the object form',
	options: {
		output: {
			manualChunks: {
				chunk: ['lib.js']
			},
			onlyExplicitManualChunks: true
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
