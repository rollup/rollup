module.exports = defineTest({
	description: 'transpiles self-closing JSX elements',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
