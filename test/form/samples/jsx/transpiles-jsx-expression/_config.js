module.exports = defineTest({
	// solo: true,
	description: 'transpiles JSX expressions',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
