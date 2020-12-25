const path = require('path');

module.exports = {
	description: 'warns for mixed exports in all chunks when preserving modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true
	},
	warnings: [
		{
			code: 'MIXED_EXPORTS',
			id: path.join(__dirname, 'main.js'),
			message:
				'Entry module "main.js" is using named and default exports together. Consumers of your bundle will have to use `chunk["default"]` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning',
			url: 'https://rollupjs.org/guide/en/#outputexports'
		},
		{
			code: 'MIXED_EXPORTS',
			id: path.join(__dirname, 'lib1.js'),
			message:
				'Entry module "lib1.js" is using named and default exports together. Consumers of your bundle will have to use `chunk["default"]` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning',
			url: 'https://rollupjs.org/guide/en/#outputexports'
		}
	]
};
