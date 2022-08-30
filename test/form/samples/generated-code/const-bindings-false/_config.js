module.exports = {
	description: 'does not use block bindings',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			generatedCode: { arrowFunctions: true, constBindings: false },
			name: 'bundle',
			noConflict: true,
			exports: 'named',
			interop: 'compat'
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
