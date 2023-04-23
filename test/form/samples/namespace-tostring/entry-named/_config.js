module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to entry chunks with named exports',
	options: {
		output: {
			generatedCode: { symbols: true },
			exports: 'named',
			name: 'bundle'
		}
	}
});
