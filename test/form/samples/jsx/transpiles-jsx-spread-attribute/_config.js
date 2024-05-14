module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX spread attributes',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
