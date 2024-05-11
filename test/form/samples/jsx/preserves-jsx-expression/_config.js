module.exports = defineTest({
	solo: true,
	description: 'preserves JSX expressions',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
