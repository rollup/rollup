module.exports = defineRollupTest({
	description: 'auto-indents with spaces and indent: true',
	options: {
		output: {
			name: 'foo',
			indent: true
		}
	}
});
