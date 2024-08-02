module.exports = defineTest({
	// solo: true,
	description: 'transpiles self-closing JSX elements',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
