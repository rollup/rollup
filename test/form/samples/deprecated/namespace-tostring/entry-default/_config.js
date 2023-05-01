module.exports = defineTest({
	description: 'does not add Symbol.toStringTag property to entry chunks with default export mode',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true,
			exports: 'default',
			name: 'bundle'
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
