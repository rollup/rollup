module.exports = defineTest({
	description: 'escapes reserved names used as props when external live-bindings are off',
	options: {
		external: ['external'],
		output: {
			exports: 'named',
			externalLiveBindings: false,
			generatedCode: { reservedNamesAsProps: false },
			interop: 'compat',
			name: 'bundle'
		}
	}
});
