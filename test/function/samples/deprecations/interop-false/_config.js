module.exports = {
	description: 'marks "false" for the "output.interop" option as deprecated',
	options: {
		strictDeprecations: true,
		external: 'external',
		output: {
			interop: false
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The boolean value "false" for the "output.interop" option is deprecated. Use "esModule", "default" or "defaultOnly" instead.',
		url: 'https://rollupjs.org/guide/en/#outputinterop'
	}
};
