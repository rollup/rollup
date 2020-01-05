module.exports = {
	description: 'mixed synthetic named exports',
	solo: true,
	options: {
		input: ['main.js'],
		plugins: [
			{
				resolveId(id) {
					if (id.endsWith('dep1.js')) {
						return {
							id,
							syntheticNamedExports: true
						};
					}
					return null;
				}
			}
		]
	}
};
