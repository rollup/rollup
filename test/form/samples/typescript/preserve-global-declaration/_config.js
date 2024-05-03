module.exports = defineTest({
	solo: true,
	description: 'preserves declarations of globals via "declare"',
	options: {
		input: ['main.ts'],
		typescript: 'preserve'
	},
	expectedWarnings: ['EMPTY_BUNDLE']
});
