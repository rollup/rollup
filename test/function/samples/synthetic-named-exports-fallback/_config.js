module.exports = {
	description: 'adds a fallback in case synthetic named exports are falsy',
	options: {
		plugins: [
			{
				transform() {
					return { syntheticNamedExports: '__synthetic' };
				}
			}
		]
	}
};
