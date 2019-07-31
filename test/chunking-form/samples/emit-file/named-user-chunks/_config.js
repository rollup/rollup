const assert = require('assert');

let referenceId;

module.exports = {
	description: 'deduplicates with named chunks defined by the user',
	options: {
		input: { mainChunk: 'main', mainChunkFacade: 'main' },
		plugins: {
			buildStart() {
				referenceId = this.emitFile({ type: 'chunk', id: 'main', name: 'ignored' });
			},
			generateBundle() {
				assert.strictEqual(this.getFileName(referenceId), 'mainChunk.js');
			}
		}
	}
};
