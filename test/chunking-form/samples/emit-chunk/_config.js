const assert = require('assert');
let metaId;

module.exports = {
	description: 'allows adding additional chunks and retrieving their file name',
	options: {
		input: 'main',
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
