const assert = require('assert');
let metaId;

module.exports = {
	description: 'allows adding additional entry points and retrieving their name',
	options: {
		input: 'main',
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
