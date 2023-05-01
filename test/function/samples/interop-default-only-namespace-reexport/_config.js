module.exports = defineTest({
	description: 'warns when reexporting a namespace with interop "defaultOnly"',
	options: {
		external: 'external',
		output: {
			interop: 'defaultOnly'
		}
	},
	warnings: [
		{
			code: 'UNEXPECTED_NAMED_IMPORT',
			exporter: 'external',
			message:
				'There was a namespace "*" reexport from the external module "external" even though its interop type is "defaultOnly". This will be ignored as namespace reexports only reexport named exports. If this is not intended, either remove or change this reexport or change the value of the "output.interop" option.',
			url: 'https://rollupjs.org/configuration-options/#output-interop'
		}
	]
});
