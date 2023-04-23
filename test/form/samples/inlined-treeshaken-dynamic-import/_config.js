module.exports = defineRollupTest({
	description: 'completely removes tree-shaken dynamic imports ',
	options: {
		output: { inlineDynamicImports: true }
	}
});
