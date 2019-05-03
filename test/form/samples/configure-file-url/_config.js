module.exports = {
	description: 'allows to configure file urls',
	options: {
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
						return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
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
