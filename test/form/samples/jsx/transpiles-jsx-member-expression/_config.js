module.exports = defineTest({
	//solo: true, //x,
	description: 'transpiles JSX member expressions',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
