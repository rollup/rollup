module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX text',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
