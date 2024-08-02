module.exports = defineTest({
	solo: true, //x,
	description: 'preserves JSX output',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
