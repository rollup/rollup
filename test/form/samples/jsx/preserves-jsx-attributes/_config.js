module.exports = defineTest({
	description: 'preserves JSX with string attributes output',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
