module.exports = defineTest({
	description: 'marks the "output.importAttributesKey" option as deprecated',
	options: {
		output: { importAttributesKey: 'assert' }
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "output.importAttributesKey" option is deprecated and will be removed in a future version of Rollup. Only use it if you need to support environments that do not understand the "with" keyword.',
		url: 'https://rollupjs.org/configuration-options/#output-importattributeskey'
	}
});
