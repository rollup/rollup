module.exports = defineTest({
	description: 'Adds semicolons at the correct positions in transpiled JSX',
	options: {
		external: ['react', 'react/jsx-runtime'],
		jsx: 'react-jsx'
	}
});
