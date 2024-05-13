module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX member expressions',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
