module.exports = defineTest({
	solo: true,
	description: 'transpiles JSX children',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
