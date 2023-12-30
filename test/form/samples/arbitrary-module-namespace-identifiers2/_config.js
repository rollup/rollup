module.exports = defineTest({
	description: 'renders exports that are not identifiers',
	verifyAst: false,
	options: {
		external: ['external'],
		output: {
			name: 'myBundle'
		}
	}
});
