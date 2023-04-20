module.exports = {
	solo: true,
	description: 'treeshakes dynamic imports when the target is statically known',
	options: {
		output: {
			inlineDynamicImports: true
		}
	}
};
