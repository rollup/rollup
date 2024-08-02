module.exports = defineTest({
	solo: true, //x,
	description: 'transpiles JSX for react',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
