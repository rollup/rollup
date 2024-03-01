module.exports = defineTest({
	solo: true,
	description: 'removes type annotations from variable declarations',
	options: {
		input: 'main.ts',
		typescript: true
	}
});
