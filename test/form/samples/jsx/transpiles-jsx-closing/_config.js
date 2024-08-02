module.exports = defineTest({
	// solo: true,
	description: 'transpiles JSX closing element',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
