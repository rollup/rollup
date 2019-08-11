module.exports = {
	description: 'throws error only with first plugin transformBundle',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				name: 'plugin1',
				transformBundle() {
					throw Error('Something happened 1');
				}
			},
			{
				name: 'plugin2',
				transformBundle() {
					throw Error('Something happened 2');
				}
			}
		]
	},
	generateError: {
		code: 'BAD_BUNDLE_TRANSFORMER',
		plugin: 'plugin1',
		hook: 'transformBundle',
		message: `Error transforming bundle with 'plugin1' plugin: Something happened 1`
	}
};
