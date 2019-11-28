module.exports = {
	description: 'warns for mixed exports in all chunks when preserving modules',
	options: {
		input: ['main.js'],
		preserveModules: true
	},
	warnings: [
		{
			code: 'MIXED_EXPORTS',
			message:
				'Entry module "lib1.js" is using named and default exports together. Consumers of your bundle will have to use `chunk["default"]` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning',
			url: 'https://rollupjs.org/guide/en/#output-exports'
		},
		{
			code: 'MIXED_EXPORTS',
			message:
				'Entry module "main.js" is using named and default exports together. Consumers of your bundle will have to use `chunk["default"]` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning',
			url: 'https://rollupjs.org/guide/en/#output-exports'
		}
	]
};
