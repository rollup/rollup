module.exports = defineTest({
	description: 'does not use block bindings',
	expectedWarnings: ['SHIMMED_EXPORT'],
	options: {
		external: ['external'],
		shimMissingExports: true,
		output: {
			exports: 'named',
			generatedCode: { arrowFunctions: true, constBindings: false },
			globals: id => id,
			interop: 'compat',
			name: 'bundle',
			noConflict: true
		},
		plugins: [
			{
				name: 'test',
				transform(code, id) {
					if (id.endsWith('synthetic.js')) {
						return { syntheticNamedExports: true };
					}
				}
			}
		]
	}
});
