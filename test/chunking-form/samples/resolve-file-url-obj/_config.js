module.exports = defineTest({
	description: 'allows to use ROLLUP_FILE_URL_OBJ to get URL objects directly',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id === 'url-test') {
						return id;
					}
				},
				load(id) {
					if (id === 'url-test') {
						const assetId = this.emitFile({
							type: 'asset',
							name: 'test.txt',
							source: 'test content'
						});
						return `
							// Test string URL replacement
							export const assetString = import.meta.ROLLUP_FILE_URL_${assetId};
							// Test URL object replacement
							export const assetObject = import.meta.ROLLUP_FILE_URL_OBJ_${assetId};
						`;
					}
				}
			}
		]
	}
});
