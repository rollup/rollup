module.exports = defineTest({
	description: 'supports an array with a single entry when inlining dynamic imports',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true,
		input: ['main']
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
