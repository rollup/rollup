module.exports = defineTest({
	description:
		'adds Symbol.toStringTag property to dynamic imports of entry chunks with default export mode',
	options: {
		strictDeprecations: false,
		input: ['main', 'foo'],
		output: {
			namespaceToStringTag: true
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
