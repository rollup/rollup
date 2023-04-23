module.exports = defineTest({
	description: 'does not indent with indent: false',
	options: {
		output: {
			name: 'foo',
			indent: false
		}
	}
});
