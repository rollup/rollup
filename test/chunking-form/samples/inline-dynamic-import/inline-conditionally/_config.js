module.exports = {
	description: 'inlines dynamic imports with side-effects that are only executed conditionally',
	options: {
		input: 'main.js',
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
