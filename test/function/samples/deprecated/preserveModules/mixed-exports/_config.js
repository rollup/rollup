const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_LIB1 = path.join(__dirname, 'lib1.js');

module.exports = defineTest({
	description: 'warns for mixed exports in all chunks when preserving modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "preserveModules" option is deprecated. Use the "output.preserveModules" option instead.',
			url: 'https://rollupjs.org/configuration-options/#output-preservemodules'
		},
		{
			code: 'MIXED_EXPORTS',
			id: ID_MAIN,
			message:
				'Entry module "main.js" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.',
			url: 'https://rollupjs.org/configuration-options/#output-exports'
		},
		{
			code: 'MIXED_EXPORTS',
			id: ID_LIB1,
			message:
				'Entry module "lib1.js" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.',
			url: 'https://rollupjs.org/configuration-options/#output-exports'
		}
	]
});
