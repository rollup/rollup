module.exports = defineTest({
	description: 'cannot have named exports if explicit export type is default',
	options: { output: { exports: 'default' } },
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message:
			'"default" was specified for "output.exports", but entry module "main.js" has the following exports: "foo"',
		url: 'https://rollupjs.org/configuration-options/#output-exports'
	}
});
