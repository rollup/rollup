module.exports = defineTest({
	description: 'throws for invalid interop values',
	options: {
		external: 'external',
		output: {
			interop: 'true'
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value "true" for option "output.interop" - use one of "compat", "auto", "esModule", "default", "defaultOnly".',
		url: 'https://rollupjs.org/configuration-options/#output-interop'
	}
});
