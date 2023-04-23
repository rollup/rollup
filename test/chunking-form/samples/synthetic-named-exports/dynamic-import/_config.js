module.exports = defineTest({
	description: 'synthetic named exports',
	options: {
		input: ['main.js'],
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('dep.js')) {
						return { code, syntheticNamedExports: true };
					}
				}
			}
		]
	}
});
