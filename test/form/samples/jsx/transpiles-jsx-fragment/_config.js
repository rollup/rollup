module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX output',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
