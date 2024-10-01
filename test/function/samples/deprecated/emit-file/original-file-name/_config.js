const assert = require('node:assert');
const path = require('node:path');

const ORIGINAL_FILE_NAME = path.join(__dirname, 'original.txt');

module.exports = defineTest({
	description: 'forwards the original file name to other hooks',
	options: {
		strictDeprecations: false,
		output: {
			assetFileNames(info) {
				if (info.name === 'with_original.txt') {
					assert.strictEqual(info.originalFileName, ORIGINAL_FILE_NAME);
				} else {
					assert.strictEqual(info.originalFileName, null);
				}
				return info.name;
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
					assert.strictEqual(bundle['with_original.txt'].name, 'with_original.txt');
					assert.strictEqual(bundle['with_original.txt'].originalFileName, ORIGINAL_FILE_NAME);
					assert.strictEqual(bundle['with_original_null.txt'].name, 'with_original_null.txt');
					assert.strictEqual(bundle['with_original_null.txt'].originalFileName, null);
					assert.strictEqual(bundle['without_original.txt'].name, 'without_original.txt');
					assert.strictEqual(bundle['without_original.txt'].originalFileName, null);
				}
			}
		]
	}
});
