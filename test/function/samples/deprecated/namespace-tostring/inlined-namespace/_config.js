module.exports = {
	description: 'adds Symbol.toStringTag property to inlined namespaces',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
		}
	}
};
