module.exports = {
	description: 'allows to configure file urls',
	options: {
		strictDeprecations: false,
		output: {
			chunkFileNames: 'nested/chunk.js'
		},
		plugins: [
			{
				resolveId(id) {
					if (id.endsWith('solved')) {
						return id;
					}
				},
				load(id) {
					if (id.endsWith('solved')) {
						const assetId = this.emitAsset(`asset-${id}.txt`, `Asset for: ${id}`);
						const chunkId = this.emitChunk('chunk.js');
						return (
							`export const asset = import.meta.ROLLUP_ASSET_URL_${assetId};\n` +
							`export const chunk = import.meta.ROLLUP_CHUNK_URL_${chunkId};`
						);
					}
				},
				resolveFileUrl({
					assetReferenceId,
					chunkId,
					chunkReferenceId,
					fileName,
					format,
					moduleId,
					relativePath
				}) {
					if (!moduleId.endsWith('resolved')) {
						return `'chunkId=${chunkId}:moduleId=${moduleId
							.replace(/\\/g, '/')
							.split('/')
							.slice(-2)
							.join(
								'/'
							)}:fileName=${fileName}:format=${format}:relativePath=${relativePath}:assetReferenceId=${assetReferenceId}:chunkReferenceId=${chunkReferenceId}'`;
					}
					return null;
				}
			},
			{
				resolveFileUrl({ moduleId }) {
					if (moduleId === 'resolved') {
						return `'resolved'`;
					}
					return null;
				}
			}
		]
	}
};
