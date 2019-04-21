const assert = require('assert');
let metaId;

module.exports = {
	description: 'retrieves the correct name of an emitted chunk in case a facade is created',
	options: {
		input: 'main',
		manualChunks: {
			'build-starter': ['buildStart']
		},
		plugins: {
			buildStart() {
				metaId = this.emitChunk('buildStart');
			},
			renderChunk() {
				assert.strictEqual(this.getChunkFileName(metaId), 'generated-buildStart.js');
			}
		}
	}
};
