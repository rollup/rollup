module.exports = {
	description: 'warns if default and named exports are used in auto mode',
	warnings: [
		{
			code: 'MIXED_EXPORTS',
			message: `Using named and default exports together. Consumers of your bundle will have to use bundle['default'] to access the default export, which may not be what you want. Use \`output.exports: 'named'\` to disable this warning`,
			url: `https://rollupjs.org/guide/en#output-exports`
		}
	]
};
