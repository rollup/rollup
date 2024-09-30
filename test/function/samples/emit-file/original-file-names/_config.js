const assert = require('node:assert');
const path = require('node:path');

const ORIGINAL_FILE_NAME_1 = path.join(__dirname, 'original.txt');
const ORIGINAL_FILE_NAME_2A = path.join(__dirname, 'original2a.txt');
const ORIGINAL_FILE_NAME_2B = path.join(__dirname, 'original2b.txt');

module.exports = defineTest({
	description: 'forwards the original file name to other hooks',
	options: {
		output: {
			assetFileNames({ names, originalFileNames, source }) {
				switch (source) {
					case 'with original file name':
						assert.deepEqual(names, ['with_original.txt']);
						assert.deepEqual(originalFileNames, [ORIGINAL_FILE_NAME_1]);
						break;
					case 'with multiple original file names':
						assert.deepEqual(names, [
							'with_multiple_original_a.txt',
							'with_multiple_original_b.txt'
						]);
						assert.deepEqual(originalFileNames, [ORIGINAL_FILE_NAME_2A, ORIGINAL_FILE_NAME_2B]);
						break;
					case 'with original file name null':
						assert.deepEqual(names, ['with_original_null.txt']);
						assert.deepEqual(originalFileNames, []);
						break;
					case 'without original file name':
						assert.deepEqual(names, ['without_original.txt']);
						assert.deepEqual(originalFileNames, []);
						break;
					default:
						throw new Error(`Unexpected source: ${source}`);
				}
				return names[0];
			}
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						type: 'asset',
						name: 'with_original.txt',
						originalFileName: ORIGINAL_FILE_NAME_1,
						source: 'with original file name'
					});
					this.emitFile({
						type: 'asset',
						name: 'with_multiple_original_a.txt',
						originalFileName: ORIGINAL_FILE_NAME_2A,
						source: 'with multiple original file names'
					});
					this.emitFile({
						type: 'asset',
						name: 'with_multiple_original_b.txt',
						originalFileName: ORIGINAL_FILE_NAME_2B,
						source: 'with multiple original file names'
					});
					this.emitFile({
						type: 'asset',
						name: 'with_original_null.txt',
						originalFileName: null,
						source: 'with original file name null'
					});
					this.emitFile({
						type: 'asset',
						name: 'without_original.txt',
						source: 'without original file name'
					});
				},
				generateBundle(options, bundle) {
					assert.deepEqual(bundle['with_original.txt'].originalFileNames, [ORIGINAL_FILE_NAME_1]);
					assert.deepEqual(bundle['with_multiple_original_a.txt'].originalFileNames, [
						ORIGINAL_FILE_NAME_2A,
						ORIGINAL_FILE_NAME_2B
					]);
					assert.deepEqual(bundle['with_original_null.txt'].originalFileNames, []);
					assert.deepEqual(bundle['without_original.txt'].originalFileNames, []);
				}
			}
		]
	}
});
