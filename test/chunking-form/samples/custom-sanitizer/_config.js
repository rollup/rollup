module.exports = {
	description: 'supports custom file name sanitizer functions',
	options: {
		plugins: [
			{
				buildStart() {
					this.emitFile({ type: 'asset', name: 'asset.txt', source: 'asset' });
				}
			}
		],
		output: {
			assetFileNames: '[name][extname]',
			sanitizeFileName(id) {
				return id.replace(/a/g, '_');
			}
		}
	}
};
