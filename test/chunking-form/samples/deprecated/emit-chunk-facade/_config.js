const assert = require('assert');
let referenceId;

module.exports = {
	description: 'retrieves the correct name of an emitted chunk in case a facade is created',
	options: {
		strictDeprecations: false,
		input: 'main',
		manualChunks: {
			'build-starter': ['buildStart']
		},
		plugins: {
			buildStart() {
				referenceId = this.emitChunk('buildStart');
			},
			renderChunk() {
				assert.strictEqual(this.getChunkFileName(referenceId), 'generated-buildStart.js');
			}
		}
	}
};
