module.exports = {
	description: 'inlines dynamic imports shared between chunks',
	options: {
		input: ['main1.js', 'main2.js'],
		plugins: {
			transform(code, id) {
				if (id.endsWith('inlined.js')) {
					return {
						code,
						inlineDynamicImport: true
					};
				}
			}
		}
	}
};
