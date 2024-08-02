module.exports = defineTest({
	solo: true, //x,
	description: 'preserves JSX with string attributes output',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
