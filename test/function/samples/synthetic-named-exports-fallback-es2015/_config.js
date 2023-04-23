module.exports = defineTest({
	description: 'adds a fallback in case synthetic named exports are falsy',
	options: {
		output: { generatedCode: 'es2015' },
		plugins: [
			{
				transform() {
					return { syntheticNamedExports: '__synthetic' };
				}
			}
		]
	}
});
