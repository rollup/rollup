module.exports = defineTest({
	description: 'marks the "output.dynamicImportFunction" option as deprecated',
	options: {
		output: {
			dynamicImportFunction: 'foo'
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "output.dynamicImportFunction" option is deprecated. Use the "renderDynamicImport" plugin hook instead.',
		url: 'https://rollupjs.org/plugin-development/#renderdynamicimport'
	}
});
