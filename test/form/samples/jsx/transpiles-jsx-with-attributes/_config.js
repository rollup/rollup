module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX with string attributes output',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
