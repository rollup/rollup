module.exports = defineTest({
	description: 'throws an error if no name is provided for a UMD bundle',
	options: { output: { format: 'umd' } },
	generateError: {
		code: 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT',
		message:
			'You must supply "output.name" for UMD bundles that have exports so that the exports are accessible in environments without a module loader.',
		url: 'https://rollupjs.org/configuration-options/#output-name'
	}
});
