module.exports = defineTest({
	solo: true,
	description: 'preserves type annotations in variable declarations',
	options: {
		input: ['main.ts'],
		typescript: 'preserve'
	},
	verifyAst: false
});
