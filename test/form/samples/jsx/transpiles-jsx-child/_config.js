module.exports = defineTest({
	solo: true, //x,
	description: 'transpiles JSX children',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
