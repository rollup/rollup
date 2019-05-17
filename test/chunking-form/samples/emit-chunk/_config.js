const assert = require('assert');
let referenceId;

module.exports = {
	description: 'allows adding additional chunks and retrieving their file name',
	options: {
		input: 'main',
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
