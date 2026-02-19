module.exports = defineTest({
	description: 'import image with different attributes',
	options: {
		plugins: [
			{
				resolveId(source, _importer, { attributes }) {
					if (source.includes('logo.png')) {
						return {
							rawId: source,
							attributes
						};
					}
				},
				load(id) {
					if (id.includes('logo.png')) {
						return `export default ${JSON.stringify(id)}`;
					}
				}
			}
		]
	}
});
