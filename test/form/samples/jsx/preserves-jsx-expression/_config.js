module.exports = defineTest({
	solo: true, //x,
	description: 'preserves JSX expressions',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
