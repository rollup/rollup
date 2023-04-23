module.exports = defineTest({
	description: 'dynamic import inlining',
	options: {
		output: { inlineDynamicImports: true }
	}
});
