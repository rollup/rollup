const assert = require('node:assert');
let referenceId;

module.exports = defineTest({
	description: 'retrieves the correct name of an emitted chunk in case a facade is created',
	options: {
		strictDeprecations: false,
		input: 'main',
		manualChunks: {
			'build-starter': ['buildStart']
		},
		plugins: {
			buildStart() {
				referenceId = this.emitFile({ type: 'chunk', id: 'buildStart' });
			},
			renderChunk() {
				assert.strictEqual(this.getFileName(referenceId), 'generated-buildStart.js');
			}
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
