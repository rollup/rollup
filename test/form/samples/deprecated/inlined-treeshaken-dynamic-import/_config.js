module.exports = defineRollupTest({
	description: 'completely removes tree-shaken dynamic imports ',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
