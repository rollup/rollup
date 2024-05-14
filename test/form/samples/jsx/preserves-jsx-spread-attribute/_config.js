module.exports = defineTest({
	solo: true,
	description: 'preserves JSX spread attributes',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
