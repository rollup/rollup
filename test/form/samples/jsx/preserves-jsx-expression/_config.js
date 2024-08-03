module.exports = defineTest({
	description: 'preserves JSX expressions',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
