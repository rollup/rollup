module.exports = defineTest({
	description:
		'JSX with react-jsx uses correct semicolon positions in variable declarations with key attributes',
	options: {
		external: ['react/jsx-runtime'],
		jsx: 'react-jsx'
	}
});
