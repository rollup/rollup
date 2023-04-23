module.exports = defineTest({
	description: 'deconflicts variables when nested dynamic imports are inlined',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
