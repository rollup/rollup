const assert = require('node:assert');
let referenceId;

module.exports = defineTest({
	description: 'allows adding additional chunks and retrieving their file name',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				referenceId = this.emitFile({ type: 'chunk', id: 'buildStart' });
			},
			resolveId(id) {
				if (id === 'external') {
					return {
						id: "./ext'ernal",
						external: true
					};
				}
			},
			renderChunk() {
				assert.strictEqual(this.getFileName(referenceId), 'generated-buildStart.js');
			}
		}
	}
});
