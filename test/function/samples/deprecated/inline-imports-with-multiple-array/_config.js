module.exports = defineTest({
	description: 'Having multiple inputs in an array is not supported when inlining dynamic imports',
	options: {
		strictDeprecations: false,
		input: ['main.js', 'lib.js'],
		inlineDynamicImports: true
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.inlineDynamicImports" - multiple inputs are not supported when "output.inlineDynamicImports" is true.',
		url: 'https://rollupjs.org/configuration-options/#output-inlinedynamicimports'
	},
	warnings: []
});
