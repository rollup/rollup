module.exports = defineTest({
	//solo: true, //x,
	description: 'transpiles JSX spread attributes',
	options: {
		external: ['react'],
		jsx: 'react'
	}
});
