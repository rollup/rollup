module.exports = {
	description: 'does not use block bindings',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			generatedCode: { arrowFunctions: true, blockBindings: false },
			name: 'bundle',
			noConflict: true,
			exports: 'named'
		},
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('/synthetic.js')) {
						return { syntheticNamedExports: true };
					}
				}
			}
		]
	}
};
