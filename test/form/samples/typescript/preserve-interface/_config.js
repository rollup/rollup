module.exports = defineTest({
	solo: true,
	description: 'preserves interfaces',
	options: {
		input: ['main.ts'],
		typescript: 'preserve'
	}
});
