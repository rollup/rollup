module.exports = {
	description: 'adds Symbol.toStringTag property to dynamic imports',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
		}
	}
};
