module.exports = defineTest({
	description: 'escapes reserved names used as props when external live-bindings are off',
	options: {
		external: ['external'],
		output: {
			compact: true,
			exports: 'named',
			externalLiveBindings: false,
			generatedCode: { reservedNamesAsProps: true },
			globals: id => id,
			interop: 'compat',
			name: 'bundle'
		}
	}
});
