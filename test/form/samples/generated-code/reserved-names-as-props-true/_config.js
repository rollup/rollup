module.exports = {
	description: 'does not escape reserved names used as props',
	options: {
		output: {
			exports: 'named',
			generatedCode: { reservedNamesAsProps: true },
			name: 'bundle'
		},
		plugins: [
			{
				transform() {
					return { syntheticNamedExports: true };
				}
			}
		]
	}
};
