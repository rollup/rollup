module.exports = defineTest({
	//solo: true, //x,
	description: 'preserves JSX member expressions',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
