module.exports = defineTest({
	description: 'preserves JSX closing element',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
