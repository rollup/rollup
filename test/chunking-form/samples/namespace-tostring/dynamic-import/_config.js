module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to dynamic imports',
	options: {
		output: {
			generatedCode: { symbols: true }
		}
	}
});
