module.exports = {
	description: 'uses block bindings',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			compact: true,
			generatedCode: { arrowFunctions: true, constBindings: true },
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
