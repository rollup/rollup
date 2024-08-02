module.exports = defineTest({
	//solo: true, //x,
	description: 'transpiles JSX closing element',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
