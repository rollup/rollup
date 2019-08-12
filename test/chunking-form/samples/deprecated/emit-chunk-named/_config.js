const assert = require('assert');
let referenceId;

module.exports = {
	description: 'allows naming emitted chunks',
	options: {
		strictDeprecations: false,
		input: 'main',
		plugins: {
			buildStart() {
				referenceId = this.emitChunk('buildStart', { name: 'nested/my-chunk' });
			},
			renderChunk() {
				assert.strictEqual(this.getChunkFileName(referenceId), 'generated-nested/my-chunk.js');
			}
		}
	}
};
