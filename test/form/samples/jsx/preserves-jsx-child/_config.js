module.exports = defineTest({
	description: 'preserves JSX children',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
