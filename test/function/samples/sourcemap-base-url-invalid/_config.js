module.exports = {
	description: 'throws for invalid sourcemapBaseUrl',
	options: {
		output: {
			sourcemapBaseUrl: 'example.com'
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.sourcemapBaseUrl" - must be a valid URL, received "example.com".',
		url: 'https://rollupjs.org/guide/en/#outputsourcemapbaseurl'
	}
};
