module.exports = defineTest({
	description: 'preserves React variable when preserving JSX output',
	options: {
		external: ['react'],
		jsx: 'preserve-react'
	}
});
