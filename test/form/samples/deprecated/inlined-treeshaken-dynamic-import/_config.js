module.exports = defineTest({
	description: 'completely removes tree-shaken dynamic imports ',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
