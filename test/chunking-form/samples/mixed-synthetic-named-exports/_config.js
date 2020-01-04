module.exports = {
	description: 'mixed synthetic named exports',
	options: {
		input: ['main.js'],
		plugins: [
			{
				resolveId(id) {
					if (id === './dep1.js') {
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
