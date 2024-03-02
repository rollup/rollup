module.exports = defineTest({
	solo: true,
	description: 'preserves JSX output',
	options: {
		external: ['react'],
		jsx: 'preserve'
	},
	expectedWarnings: ['UNUSED_EXTERNAL_IMPORT'],
	verifyAst: false
});
