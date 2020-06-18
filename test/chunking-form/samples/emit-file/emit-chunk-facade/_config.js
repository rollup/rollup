const assert = require('assert');
let referenceId;

module.exports = {
	description: 'retrieves the correct name of an emitted chunk in case a facade is created',
	options: {
		input: 'main',
		output: {
			manualChunks: {
				'build-starter': ['buildStart']
			}
		},
		plugins: {
			buildStart() {
				referenceId = this.emitFile({ type: 'chunk', id: 'buildStart' });
			},
			renderChunk() {
				assert.strictEqual(this.getFileName(referenceId), 'generated-buildStart.js');
			}
		}
	}
};
