module.exports = defineTest({
	description: 'escapes reserved names used as props',
	options: {
		input: ['main', 'main2'],
		external: ['external'],
		output: {
			exports: 'named',
			generatedCode: { reservedNamesAsProps: false },
			name: 'bundle'
		}
	}
});
