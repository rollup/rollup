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
				assert.deepStrictEqual(bundle[fileNameWithoutName], {
					fileName: 'generated-asset',
					name: undefined,
					names: [],
					needsCodeReference: false,
					originalFileName: null,
					originalFileNames: [],
					source: 'renderChunk-without-names',
					type: 'asset'
				});
				this.emitFile({
					type: 'asset',
					source: 'renderChunk-without-names',
					name: 'new-name.txt',
					originalFileName: 'original-new-name.txt'
				});
				assert.deepStrictEqual(bundle[fileNameWithoutName], {
					fileName: 'generated-asset',
					name: undefined,
					names: ['new-name.txt'],
					needsCodeReference: false,
					originalFileName: null,
					originalFileNames: ['original-new-name.txt'],
					source: 'renderChunk-without-names',
					type: 'asset'
				});

				const fileNameWithName = this.getFileName(referenceIdWithName);
				assert.strictEqual(fileNameWithName, 'generated-with-names.txt');
				assert.deepStrictEqual(bundle[fileNameWithName], {
					fileName: 'generated-with-names.txt',
					name: 'with-names.txt',
					names: ['with-names.txt'],
					needsCodeReference: false,
					originalFileName: 'with-names-original.txt',
					originalFileNames: ['with-names-original.txt'],
					source: 'renderChunk-with-names',
					type: 'asset'
				});
				this.emitFile({
					type: 'asset',
					name: 'second-name.txt',
					originalFileName: 'original-second-name.txt',
					source: 'renderChunk-with-names'
				});
				assert.deepStrictEqual(bundle[fileNameWithName], {
					fileName: 'generated-with-names.txt',
					name: 'with-names.txt',
					names: ['with-names.txt', 'second-name.txt'],
					needsCodeReference: false,
					originalFileName: 'with-names-original.txt',
					originalFileNames: ['with-names-original.txt', 'original-second-name.txt'],
					source: 'renderChunk-with-names',
					type: 'asset'
				});
			}
		}
	}
});
