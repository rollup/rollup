const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'allows to configure file urls',
	options: {
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
						const assetId = this.emitFile({
							type: 'asset',
							name: `asset-${id}.txt`,
							source: `Asset for: ${id}`
						});
						const chunkId = this.emitFile({ type: 'chunk', id: 'chunk.js' });
						return (
							`export const asset = import.meta.ROLLUP_FILE_URL_${assetId};\n` +
							`export const chunk = import.meta.ROLLUP_FILE_URL_${chunkId};`
						);
					}
				},
				resolveFileUrl({
					chunkId,
					fileName,
					format,
					moduleAttributes,
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
