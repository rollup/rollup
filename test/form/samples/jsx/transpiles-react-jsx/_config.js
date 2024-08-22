module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX for react',
	options: {
		external: ['react/jsx-runtime'],
		jsx: 'react-jsx'
	}
});
