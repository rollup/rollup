module.exports = defineTest({
	description: 'preserves shadowed exports names for eval in amd output',
	expectedWarnings: ['EVAL'],
	formats: ['amd'],
	options: {
		output: {
			amd: { id: 'test/module' },
			esModule: true,
			exports: 'named',
			strict: false
		}
	}
});
