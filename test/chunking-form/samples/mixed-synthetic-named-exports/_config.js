// TODO Lukas what if the namespace contains synthetic reexported variables?
// TODO Lukas what about external modules with synthetic named exports?

module.exports = {
	description: 'mixed synthetic named exports',
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
