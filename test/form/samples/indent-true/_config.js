module.exports = defineRollupTest({
	description: 'auto-indents with indent: true',
	options: {
		output: {
			name: 'foo',
			indent: true
		}
	}
});
