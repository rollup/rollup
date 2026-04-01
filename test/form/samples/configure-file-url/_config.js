const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'allows to configure file urls',
	options: {
		plugins: [
			{
				name: 'first',
				resolveId(id) {
					if (id.endsWith('solved')) {
						return id;
					}
				},
				load(id) {
					if (id.endsWith('solved')) {
						const assetId = this.emitFile({
							type: 'asset',
							name: `asset-${id}.txt`,
							source: `Asset for: ${id}`
						});
						return `export default import.meta.ROLLUP_FILE_URL_${assetId};`;
					}
				},
				resolveFileUrl({
					moduleAttributes,
					chunkId,
					fileName,
					format,
					moduleId,
					referenceId,
					relativePath
				}) {
					assert.deepEqual(moduleAttributes, {});
					if (!moduleId.endsWith('resolved')) {
						return `'chunkId=${chunkId}:moduleId=${moduleId
							.replace(/\\/g, '/')
							.split('/')
							.slice(-2)
							.join(
								'/'
							)}:fileName=${fileName}:format=${format}:relativePath=${relativePath}:referenceId=${referenceId}'`;
					}
					return null;
				}
			},
			{
				name: 'second',
				resolveFileUrl({ moduleAttributes, moduleId }) {
					assert.deepEqual(moduleAttributes, {});
					if (moduleId === 'resolved') {
						return `'resolved'`;
					}
					return null;
				}
			}
		]
	}
});
