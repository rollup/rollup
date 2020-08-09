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
			'The value "true" is not supported for "output.interop". Use one of "auto", "esModule", "default", "defaultOnly", true, false instead.',
		url: 'https://rollupjs.org/guide/en/#outputinterop'
	}
};
