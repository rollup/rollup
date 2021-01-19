module.exports = {
	description: 'handles reexporting a synthetic namespace from a non-synthetic module',
	options: {
		plugins: [
			{
				transform() {
					return { syntheticNamedExports: '__synth' };
				}
			}
		]
	}
};
