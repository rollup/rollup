module.exports = defineTest({
	solo: true,
	description: 'preserves React variable when preserving JSX output',
	options: {
		external: ['react'],
		jsx: 'preserve-react'
	}
});
