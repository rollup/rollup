module.exports = defineTest({
	description:
		'adds Symbol.toStringTag property to dynamic imports of entry chunks with default export mode',
	options: {
		input: ['main', 'foo'],
		output: {
			generatedCode: { symbols: true }
		}
	}
});
