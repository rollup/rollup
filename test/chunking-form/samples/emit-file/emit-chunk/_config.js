const assert = require('assert');
let referenceId;

module.exports = {
	description: 'allows adding additional chunks and retrieving their file name',
	options: {
		input: 'main',
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
