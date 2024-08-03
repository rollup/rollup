module.exports = defineTest({
	description: 'preserves JSX member expressions',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
