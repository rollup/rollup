const assert = require('assert');
let metaId;

module.exports = {
	description: 'allows naming emitted chunks',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				metaId = this.emitChunk('buildStart', { name: 'nested/my-chunk' });
			},
			renderChunk() {
				assert.strictEqual(this.getChunkFileName(metaId), 'generated-nested/my-chunk.js');
			}
		}
	}
};
