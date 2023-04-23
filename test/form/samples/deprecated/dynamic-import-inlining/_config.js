module.exports = defineTest({
	description: 'dynamic import inlining',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
