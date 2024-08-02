module.exports = defineTest({
	solo: true, //x,
	description: 'transpiles JSX text',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
