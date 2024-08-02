module.exports = defineTest({
	//solo: true, //x,
	description: 'transpiles JSX expressions',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
