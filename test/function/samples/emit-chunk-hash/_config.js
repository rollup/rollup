const assert = require('node:assert');
let referenceId;

module.exports = defineTest({
	description: 'gives access to the hashed filed name via this.getFileName in generateBundle',
	options: {
		input: 'main',
		output: {
			chunkFileNames: '[name]-[hash].js'
		},
		plugins: {
			buildStart() {
				referenceId = this.emitFile({ type: 'chunk', id: 'emitted' });
			},
			generateBundle() {
				assert.strictEqual(this.getFileName(referenceId), 'emitted-38bdd9b2.js');
			}
		}
	}
});
