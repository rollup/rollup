module.exports = defineTest({
	// solo: true,
	description: 'preserves JSX text',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
