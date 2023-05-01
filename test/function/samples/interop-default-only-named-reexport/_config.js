module.exports = defineTest({
	description: 'throws when reexporting a namespace with interop "defaultOnly"',
	options: {
		external: 'external',
		output: {
			interop: 'defaultOnly'
		}
	},
	generateError: {
		code: 'UNEXPECTED_NAMED_IMPORT',
		exporter: 'external',
		url: 'https://rollupjs.org/configuration-options/#output-interop',
		message:
			'The named export "foo" was reexported from the external module "external" even though its interop type is "defaultOnly". Either remove or change this reexport or change the value of the "output.interop" option.'
	}
});
