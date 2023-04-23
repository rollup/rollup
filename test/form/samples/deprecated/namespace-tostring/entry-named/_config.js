module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to entry chunks with named exports',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true,
			exports: 'named',
			name: 'bundle'
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
