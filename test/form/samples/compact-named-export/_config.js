module.exports = defineTest({
	description: 'properly handles named export live bindings in compact mode',
	options: {
		output: {
			name: 'foo',
			compact: true
		}
	}
});
