module.exports = {
	description: 'does not add Symbol.toStringTag property to entry chunks with default export mode',
	options: {
		output: {
			generatedCode: { symbols: true },
			exports: 'default',
			name: 'bundle'
		}
	}
};
