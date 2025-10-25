module.exports = defineTest({
	description: 'renders exports that are not identifiers',
	verifyAst: false,
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
