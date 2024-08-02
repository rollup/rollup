module.exports = defineTest({
	// solo: true,
	description: 'preserves JSX children',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
