module.exports = {
	description: 'handles reexporting a synthetic namespace from a non-synthetic module',
	options: {
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('synthetic.js')) {
						return { syntheticNamedExports: '__synth' };
					}
				}
			}
		]
	}
};
