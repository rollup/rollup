module.exports = defineTest({
	solo: true, //x,
	description: 'transpiles JSX output',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
