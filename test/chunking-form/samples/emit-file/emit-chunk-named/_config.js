const assert = require('node:assert');
let referenceId;

module.exports = defineTest({
	description: 'allows naming emitted chunks',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				referenceId = this.emitFile({ type: 'chunk', id: 'buildStart', name: 'nested/my-chunk' });
			},
			renderChunk() {
				assert.strictEqual(this.getFileName(referenceId), 'generated-nested/my-chunk.js');
			}
		}
	}
});
