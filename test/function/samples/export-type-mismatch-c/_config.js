module.exports = defineTest({
	description: 'cannot have named exports if explicit export type is default',
	options: { output: { exports: 'none' } },
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message:
			'"none" was specified for "output.exports", but entry module "main.js" has the following exports: "default"',
		url: 'https://rollupjs.org/configuration-options/#output-exports'
	}
});
