module.exports = defineTest({
	description: 'Inlining dynamic imports is not supported when preserving modules',
	options: {
		input: ['main.js'],
		output: {
			preserveModules: true,
			inlineDynamicImports: true
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.inlineDynamicImports" - this option is not supported for "output.preserveModules".',
		url: 'https://rollupjs.org/configuration-options/#output-inlinedynamicimports'
	}
});
