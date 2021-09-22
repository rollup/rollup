module.exports = {
	description: 'Inlining dynamic imports is not supported when preserving modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		inlineDynamicImports: true
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.inlineDynamicImports" - this option is not supported for "output.preserveModules".',
		url: 'https://rollupjs.org/guide/en/#outputinlinedynamicimports'
	}
};
