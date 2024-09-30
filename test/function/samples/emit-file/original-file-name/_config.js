const assert = require('node:assert');
const path = require('node:path');

const ORIGINAL_FILE_NAME = path.join(__dirname, 'original.txt');

module.exports = defineTest({
	description: 'forwards the original file name to other hooks',
	options: {
		output: {
			assetFileNames(info) {
				if (info.names.includes('with_original.txt')) {
					assert.deepStrictEqual(info.originalFileNames, [ORIGINAL_FILE_NAME]);
				} else {
					assert.deepStrictEqual(info.originalFileNames, []);
				}
				return info.names[0];
			}
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						type: 'asset',
						name: 'with_original.txt',
						originalFileName: ORIGINAL_FILE_NAME,
						source: 'with original file name'
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
					assert.deepStrictEqual(bundle['with_original.txt'].originalFileNames, [
						ORIGINAL_FILE_NAME
					]);
					assert.deepStrictEqual(bundle['with_original_null.txt'].originalFileNames, []);
					assert.deepStrictEqual(bundle['without_original.txt'].originalFileNames, []);
				}
			}
		]
	}
});
