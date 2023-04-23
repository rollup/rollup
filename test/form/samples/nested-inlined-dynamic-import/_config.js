module.exports = defineRollupTest({
	description: 'deconflicts variables when nested dynamic imports are inlined',
	options: {
		output: { inlineDynamicImports: true }
	}
});
