module.exports = defineTest({
	// solo: true,
	description: 'preserves JSX closing element',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
