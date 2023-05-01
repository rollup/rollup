module.exports = defineTest({
	description: 'auto-indents with indent: true',
	options: {
		output: {
			name: 'foo',
			indent: '  '
		}
	}
});
