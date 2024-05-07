module.exports = defineTest({
	solo: true,
	description: 'preserves type alias declarations',
	options: {
		input: ['main.ts'],
		typescript: 'preserve'
	}
});
