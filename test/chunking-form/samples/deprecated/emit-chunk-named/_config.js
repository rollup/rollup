const assert = require('assert');
let referenceIdBuildStart;
let referenceIdTransform;

module.exports = {
	description: 'allows naming emitted chunks',
	expectedWarnings: ['DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		input: 'main',
		plugins: {
			buildStart() {
				referenceIdBuildStart = this.emitChunk('buildStart', { name: 'nested/build-start' });
			},
			transform(code, id) {
				if (id.endsWith('main.js')) {
					referenceIdTransform = this.emitChunk('transform', { name: 'nested/transform' });
				}
			},
			renderChunk() {
				assert.strictEqual(
					this.getChunkFileName(referenceIdBuildStart),
					'generated-nested/build-start.js'
				);
				assert.strictEqual(
					this.getChunkFileName(referenceIdTransform),
					'generated-nested/transform.js'
				);
			}
		}
	}
};
