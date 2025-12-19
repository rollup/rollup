module.exports = defineTest({
	description: 'escapes reserved names used as props',
	options: {
		external: ['external', 'external2', 'externalDefaultOnly'],
		output: {
			exports: 'named',
			generatedCode: { reservedNamesAsProps: true },
			globals: id => id,
			interop(id) {
				if (id === 'externalDefaultOnly') return 'defaultOnly';
				return 'auto';
			},
			name: 'bundle'
		},
		plugins: [
			{
				name: 'test',
				transform() {
					return { syntheticNamedExports: true };
				}
			}
		]
	}
});
