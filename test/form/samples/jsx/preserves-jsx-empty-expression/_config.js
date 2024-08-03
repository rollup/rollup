module.exports = defineTest({
	description: 'preserves JSX output',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
