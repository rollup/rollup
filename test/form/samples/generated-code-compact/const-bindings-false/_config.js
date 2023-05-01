module.exports = defineTest({
	description: 'does not use block bindings',
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
