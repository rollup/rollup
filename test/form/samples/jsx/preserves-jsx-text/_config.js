module.exports = defineTest({
	//solo: true, //x,
	description: 'preserves JSX text',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
