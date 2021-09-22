module.exports = {
	description: 'uses block bindings',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			generatedCode: { arrowFunctions: true, constBindings: true },
			name: 'bundle',
			noConflict: true,
			exports: 'named'
		},
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('synthetic.js')) {
						return { syntheticNamedExports: true };
					}
				}
			}
		]
	}
};
