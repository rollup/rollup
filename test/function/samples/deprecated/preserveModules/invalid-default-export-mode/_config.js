module.exports = defineTest({
	description: 'throws when using default export mode with named exports',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		output: {
			exports: 'default'
		}
	},
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message:
			'"default" was specified for "output.exports", but entry module "lib.js" has the following exports: "value"',
		url: 'https://rollupjs.org/configuration-options/#output-exports'
	}
});
