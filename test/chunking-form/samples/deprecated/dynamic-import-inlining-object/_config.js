module.exports = defineTest({
	description: 'supports an object with a single entry when inlining dynamic imports',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true,
		input: { entry: 'main' }
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
