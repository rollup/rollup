module.exports = defineTest({
	description: 'completely removes tree-shaken dynamic imports ',
	options: {
		output: { inlineDynamicImports: true }
	}
});
