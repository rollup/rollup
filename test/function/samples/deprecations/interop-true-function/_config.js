module.exports = {
	description:
		'marks "true" for the "output.interop" option as deprecated when using the function form',
	options: {
		strictDeprecations: true,
		external: 'external',
		output: {
			interop: () => true
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The boolean value "true" for the "output.interop" option is deprecated. Use "auto" instead.',
		url: 'https://rollupjs.org/guide/en/#outputinterop'
	}
};
