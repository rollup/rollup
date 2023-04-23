module.exports = defineRollupTest({
	description: 'does not expose the synthetic namespace if an entry point uses a string value',
	options: {
		input: ['main', 'other'],
		plugins: [
			{
				transform(code) {
					return { code, syntheticNamedExports: '__synthetic' };
				}
			}
		]
	}
});
