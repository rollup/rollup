module.exports = defineTest({
	//solo: true, //x,
	description: 'transpiles self-closing JSX elements',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
