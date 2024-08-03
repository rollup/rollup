module.exports = defineTest({
	description: 'transpiles JSX for react',
	options: {
		external: ['react/jsx-runtime'],
		jsx: 'react-jsx'
	}
});
