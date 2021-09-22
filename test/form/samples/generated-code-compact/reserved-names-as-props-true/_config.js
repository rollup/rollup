module.exports = {
	description: 'escapes reserved names used as props',
	options: {
		external: ['external', 'external2', 'externalDefaultOnly'],
		output: {
			compact: true,
			exports: 'named',
			generatedCode: { reservedNamesAsProps: true },
			interop(id) {
				if (id === 'externalDefaultOnly') return 'defaultOnly';
				return 'auto';
			},
			name: 'bundle'
		},
		plugins: [
			{
				transform(code, id) {
					return { syntheticNamedExports: true };
				}
			}
		]
	}
};
