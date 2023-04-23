module.exports = defineTest({
	description: 'supports an array with a single entry when inlining dynamic imports',
	options: {
		output: { inlineDynamicImports: true },
		input: ['main']
	}
});
