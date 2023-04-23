module.exports = defineRollupTest({
	description: 'dynamic import inlining',
	options: {
		output: { inlineDynamicImports: true }
	}
});
