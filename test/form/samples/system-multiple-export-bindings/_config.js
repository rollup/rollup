module.exports = defineTest({
	description: 'supports multiple live bindings for the same symbol in systemJS',
	options: {
		output: {
			format: 'system',
			exports: 'named'
		}
	}
});
