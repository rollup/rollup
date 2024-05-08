module.exports = defineTest({
	solo: true,
	description: 'preserves local React variable when preserving JSX output',
	options: {
		external: ['react'],
		jsx: 'preserve-react'
	},
	expectedWarnings: ['UNUSED_EXTERNAL_IMPORT']
});
