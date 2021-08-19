module.exports = {
	description: 'escapes reserved names used as props',
	options: {
		external: ['external'],
		output: {
			compact: true,
			exports: 'named',
			generatedCode: { reservedNamesAsProps: false },
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
