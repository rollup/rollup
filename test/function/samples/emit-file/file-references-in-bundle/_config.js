const assert = require('node:assert');

module.exports = {
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
		__dirname: '/dir' // This should be an absolute path.
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			asset: 'file:///dir/assets/asset.txt',
			chunk: 'file:///dir/chunks/ref.js',
			urlEncoding: 'file:///dir/chunks/My%252FFile.js'
		});
	}
};
