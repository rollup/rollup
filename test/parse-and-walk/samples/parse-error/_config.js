module.exports = defineTest({
	description: 'parseAndWalk should throw on invalid syntax',
	walk: {
		Identifier() {
			// Should not reach here
		}
	},
	error: {
		code: 'PARSE_ERROR',
		message: 'Expression expected',
		pos: 10
	}
});
