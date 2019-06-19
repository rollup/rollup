module.exports = {
	description: 'allows to configure asset urls',
	options: {
		strictDeprecations: false,
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
				resolveAssetUrl({ chunkId, moduleId, assetFileName, relativeAssetPath }) {
					if (!moduleId.endsWith('resolved')) {
						return `'${chunkId}:${moduleId
							.replace(/\\/g, '/')
							.split('/')
							.slice(-2)
							.join('/')}:${assetFileName}:${relativeAssetPath}'`;
					}
					return null;
				}
			},
			{
				resolveAssetUrl({ moduleId }) {
					if (moduleId === 'resolved') {
						return `'resolved'`;
					}
					return null;
				}
			}
		]
	}
};
