module.exports = {
	description: 'adds Symbol.toStringTag property to inlined namespaces',
	options: {
		output: {
			generatedCode: { symbols: true }
		}
	}
};
