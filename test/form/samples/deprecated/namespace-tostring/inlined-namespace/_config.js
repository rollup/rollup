module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to inlined namespaces',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
