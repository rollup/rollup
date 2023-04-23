module.exports = defineTest({
	description: 'throws when using none export mode with named exports',
	options: {
		input: ['main.js'],
		output: {
			exports: 'none',
			preserveModules: true
		}
	},
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message:
			'"none" was specified for "output.exports", but entry module "lib.js" has the following exports: "value"',
		url: 'https://rollupjs.org/configuration-options/#output-exports'
	}
});
