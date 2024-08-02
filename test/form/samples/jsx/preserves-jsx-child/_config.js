module.exports = defineTest({
	solo: true, //x,
	description: 'preserves JSX children',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
