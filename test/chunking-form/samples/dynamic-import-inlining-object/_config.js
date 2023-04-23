module.exports = defineTest({
	description: 'supports an object with a single entry when inlining dynamic imports',
	options: {
		output: { inlineDynamicImports: true },
		input: { entry: 'main' }
	}
});
