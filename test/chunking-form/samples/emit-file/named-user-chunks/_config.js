const assert = require('node:assert');

let referenceIdName;
let referenceIdFileName1;
let referenceIdFileName2;

module.exports = defineTest({
	description: 'deduplicates with named chunks defined by the user',
	options: {
		input: { mainChunk: 'main', mainChunkFacade: 'main' },
		plugins: {
			buildStart() {
				referenceIdName = this.emitFile({ type: 'chunk', id: 'main', name: 'ignored' });
				referenceIdFileName1 = this.emitFile({
					type: 'chunk',
					id: 'main',
					fileName: 'explicit-name1.js'
				});
				referenceIdFileName2 = this.emitFile({
					type: 'chunk',
					id: 'main',
					fileName: 'explicit-name2.js'
				});
			},
			generateBundle() {
				assert.strictEqual(this.getFileName(referenceIdName), 'mainChunk.js');
				assert.strictEqual(this.getFileName(referenceIdFileName1), 'explicit-name1.js');
				assert.strictEqual(this.getFileName(referenceIdFileName2), 'explicit-name2.js');
			}
		}
	}
});
