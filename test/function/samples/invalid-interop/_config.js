module.exports = {
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
			'Invalid value "true" for option "output.interop" - use one of "auto", "esModule", "default", "defaultOnly", true, false.',
		url: 'https://rollupjs.org/guide/en/#outputinterop'
	}
};
