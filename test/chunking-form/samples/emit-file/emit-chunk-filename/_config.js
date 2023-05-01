const assert = require('node:assert');
let referenceId;

module.exports = defineTest({
	description: 'supports specifying a file name when emitting a chunk',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				referenceId = this.emitFile({
					type: 'chunk',
					id: 'buildStart',
					fileName: 'custom/build-start-chunk.js'
				});
			},
			renderChunk() {
				assert.strictEqual(this.getFileName(referenceId), 'custom/build-start-chunk.js');
			},
			generateBundle(options, bundle) {
				assert.deepStrictEqual(
					Object.keys(bundle).map(key => bundle[key].name),
					['build-start-chunk', 'main', 'buildStart']
				);
			}
		}
	}
});
