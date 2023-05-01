module.exports = defineTest({
	description: 'mixed synthetic named exports',
	options: {
		input: ['main.js'],
		plugins: [
			{
				name: 'test-plugin',
				resolveId(id) {
					if (id.endsWith('dep1.js')) {
						return {
							id,
							syntheticNamedExports: true
						};
					}
				}
			}
		]
	}
});
