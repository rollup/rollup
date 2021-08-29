module.exports = {
	description: 'throws for unknown presets for the generatedCode option',
	options: {
		output: {
			generatedCode: { preset: 'some-string' }
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value "some-string" for option "output.generatedCode.preset" - valid values are "es2015" and "es5".',
		url: 'https://rollupjs.org/guide/en/#outputgeneratedcode'
	}
};
