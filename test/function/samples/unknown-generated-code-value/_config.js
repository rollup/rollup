module.exports = defineTest({
	description: 'throws for unknown string values for the generatedCode option',
	options: {
		output: {
			// @ts-expect-error expected error
			generatedCode: 'some-string'
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value "some-string" for option "output.generatedCode" - valid values are "es2015" and "es5". You can also supply an object for more fine-grained control.',
		url: 'https://rollupjs.org/configuration-options/#output-generatedcode'
	}
});
