module.exports = defineTest({
	description: 'preserves JSX spread attributes',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
