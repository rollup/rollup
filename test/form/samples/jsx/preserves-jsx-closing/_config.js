module.exports = defineTest({
	solo: true, //x,
	description: 'preserves JSX closing element',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
