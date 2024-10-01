const assert = require('node:assert');

let referenceIdWithoutName;
let referenceIdWithName;

module.exports = defineTest({
	description: 'updates asset names when emitting in generate phase',
	options: {
		strictDeprecations: false,
		output: { assetFileNames: 'generated-[name][extname]' },
		plugins: {
			renderChunk() {
				referenceIdWithoutName = this.emitFile({
					type: 'asset',
					source: 'renderChunk-without-names'
				});
				referenceIdWithName = this.emitFile({
					type: 'asset',
					name: 'with-names.txt',
					originalFileName: 'with-names-original.txt',
					source: 'renderChunk-with-names'
				});
			},
			generateBundle(options, bundle) {
				const fileNameWithoutName = this.getFileName(referenceIdWithoutName);
				assert.strictEqual(fileNameWithoutName, 'generated-asset');
				assert.strictEqual(bundle[fileNameWithoutName].name, undefined);
				assert.strictEqual(bundle[fileNameWithoutName].originalFileName, null);
				this.emitFile({
					type: 'asset',
					source: 'renderChunk-without-names',
					name: 'new-name.txt',
					originalFileName: 'original-new-name.txt'
				});
				assert.strictEqual(bundle[fileNameWithoutName].name, undefined);
				assert.strictEqual(bundle[fileNameWithoutName].originalFileName, null);

				const fileNameWithName = this.getFileName(referenceIdWithName);
				assert.strictEqual(fileNameWithName, 'generated-with-names.txt');
				assert.strictEqual(bundle[fileNameWithName].name, 'with-names.txt');
				assert.strictEqual(bundle[fileNameWithName].originalFileName, 'with-names-original.txt');
				this.emitFile({
					type: 'asset',
					name: 'second-name.txt',
					originalFileName: 'original-second-name.txt',
					source: 'renderChunk-with-names'
				});
				assert.strictEqual(bundle[fileNameWithName].name, 'with-names.txt');
				assert.strictEqual(bundle[fileNameWithName].originalFileName, 'with-names-original.txt');
			}
		}
	}
});
