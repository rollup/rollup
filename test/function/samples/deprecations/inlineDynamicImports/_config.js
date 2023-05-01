module.exports = defineTest({
	description: 'marks the "inlineDynamicImports" input option as deprecated',
	options: {
		inlineDynamicImports: true
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "inlineDynamicImports" option is deprecated. Use the "output.inlineDynamicImports" option instead.',
		url: 'https://rollupjs.org/configuration-options/#output-inlinedynamicimports'
	}
});
