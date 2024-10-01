module.exports = defineTest({
	description: 'transpiles JSX for react',
	options: {
		external: ['react', 'react/jsx-runtime'],
		jsx: { mode: 'classic' }
	}
});
