module.exports = defineTest({
	description: 'preserves JSX text',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
