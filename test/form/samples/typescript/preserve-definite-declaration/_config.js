module.exports = defineTest({
	solo: true,
	description: 'preserves non-undefined declarations',
	options: {
		input: ['main.ts'],
		typescript: 'preserve'
	}
});
