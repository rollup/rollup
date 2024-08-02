module.exports = defineTest({
	//solo: true, //x,
	description: 'preserves JSX spread attributes',
	options: {
		external: ['react'],
		jsx: 'preserve'
	}
});
