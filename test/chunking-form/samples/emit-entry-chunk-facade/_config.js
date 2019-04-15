const assert = require('assert');
let metaId;

module.exports = {
	description: 'retrieves the correct name of emitted entry chunk in case a facade is created',
	options: {
		input: 'main',
		manualChunks: {
			'build-starter': ['buildStart']
		},
		plugins: {
			buildStart() {
				metaId = this.emitEntryChunk('buildStart');
			},
			renderChunk() {
				assert.strictEqual(this.getChunkFileName(metaId), 'buildStart.js');
			}
		}
	}
};
