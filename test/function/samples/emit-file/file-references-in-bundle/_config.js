const assert = require('node:assert');
const { pathToFileURL } = require('node:url');

module.exports = defineTest({
	description: 'lists referenced files in the bundle',
	options: {
		input: 'main',
		plugins: {
			transform() {
				return `export const asset = import.meta.ROLLUP_FILE_URL_${this.emitFile({
					type: 'asset',
					name: 'asset.txt',
					source: 'asset'
				})};\nexport const chunk = import.meta.ROLLUP_FILE_URL_${this.emitFile({
					type: 'chunk',
					id: 'ref.js'
				})};\nexport const urlEncoding = import.meta.ROLLUP_FILE_URL_${this.emitFile({
					type: 'chunk',
					id: 'My%2FFile.js'
				})}`;
			},
			generateBundle(options, bundle) {
				assert.deepStrictEqual(bundle['main.js'].referencedFiles, [
					'assets/asset.txt',
					'chunks/ref.js',
					'chunks/My%2FFile.js'
				]);
			}
		},
		output: {
			assetFileNames: 'assets/[name][extname]',
			chunkFileNames: 'chunks/[name].js'
		}
	},
	context: {
		__dirname: 'dir'
	},
	exports(exports) {
		const directoryURL = pathToFileURL('dir');
		assert.deepStrictEqual(exports, {
			asset: `${directoryURL}/assets/asset.txt`,
			chunk: `${directoryURL}/chunks/ref.js`,
			urlEncoding: `${directoryURL}/chunks/My%252FFile.js`
		});
	}
});
