module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX for react',
	options: {
		external: ['react', 'react/jsx-runtime'],
		jsx: 'react-jsx'
	}
});
