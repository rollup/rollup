module.exports = defineTest({
	description: 'adds attributes to file resolveFileUrl and resolveImportMeta hooks',
	options: {
		plugins: [
			{
				name: 'first',
				transform(code) {
					return code.replace('PLACEHOLDER', () => {
						const assetId = this.emitFile({
							type: 'asset',
							name: 'my-asset',
							source: 'Text content'
						});
						return `import.meta.ROLLUP_FILE_URL_${assetId}`;
					});
				},
				resolveFileUrl({ attributes }) {
					return `'attributes=${JSON.stringify(attributes)}'`;
				},
				resolveImportMeta(property, { attributes }) {
					return `'attributes=${JSON.stringify(attributes)}'`;
				}
			}
		]
	}
});
