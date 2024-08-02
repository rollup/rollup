module.exports = defineTest({
	//solo: true, //x,
	description: 'transpiles JSX with string attributes output',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
