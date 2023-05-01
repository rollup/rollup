module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to dynamic imports',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
