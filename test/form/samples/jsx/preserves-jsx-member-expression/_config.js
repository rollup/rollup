module.exports = defineTest({
	solo: true,
	description: 'preserves JSX member expressions',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
