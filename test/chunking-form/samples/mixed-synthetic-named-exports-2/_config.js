module.exports = {
	description: 'mixed synthetic named exports',
	options: {
		input: ['main.js'],
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('dep1.js') || id.endsWith('dep2.js')) {
						return {
							code,
							syntheticNamedExports: true
						};
					}
					return null;
				}
			}
		]
	}
};
