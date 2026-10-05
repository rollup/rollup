const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'uses the manualChunks form replaced by an outputOptions hook for the onlyExplicitManualChunks default',
	options: {
		output: {
			manualChunks: {}
		},
		plugins: [
			{
				name: 'test-plugin',
				outputOptions(options) {
					return { ...options, manualChunks: () => null };
				},
				renderStart(outputOptions) {
					assert.strictEqual(outputOptions.onlyExplicitManualChunks, true);
				}
			}
		]
	}
});
