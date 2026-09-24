const assert = require('node:assert');
let referenceId;

module.exports = defineTest({
	description: 'supports setting asset sources as side effect of the manual chunks option',
	warnings: [
		{
			code: 'EMPTY_MANUAL_CHUNK',
			message:
				'Manual chunk "foo" was not generated as none of its modules are included in the bundle.',
			names: ['foo']
		}
	],
	options: {
		output: {
			manualChunks: { foo: ['manual.js'] },
			assetFileNames: '[name]-[hash][extname]'
		},
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('manual.js')) {
						referenceId = this.emitFile({ type: 'asset', name: 'emitted.txt' });
					}
				},
				moduleParsed({ id }) {
					if (id.endsWith('manual.js')) {
						this.setAssetSource(referenceId, 'emitted');
					}
				},
				generateBundle() {
					assert.strictEqual(this.getFileName(referenceId), 'emitted-C6bBH0W1.txt');
				}
			}
		]
	}
});
