module.exports = defineTest({
	solo: true, //x,
	description: 'preserves React variable when preserving JSX output',
	options: {
		external: ['react'],
		jsx: 'preserve-react'
	}
});
