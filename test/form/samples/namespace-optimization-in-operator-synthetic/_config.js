module.exports = defineTest({
	description: 'disables optimization for synthetic named exports when using the in operator',
	options: {
		plugins: [
			{
				name: 'virtual-synthatic',
				resolveId(id) {
					if (id === 'virtual:synthetic') {
						return '\0' + id;
					}
				},
				load(id) {
					if (id === '\0virtual:synthetic') {
						const code = `
							export const __moduleExports = { a: true };
						`;
						return {
							code,
							syntheticNamedExports: '__moduleExports'
						};
					}
				}
			}
		]
	}
});
