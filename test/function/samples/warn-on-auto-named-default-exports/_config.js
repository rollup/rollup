module.exports = {
	description: 'warns if default and named exports are used in auto mode',
	warnings: [
		{
			code: 'MIXED_EXPORTS',
			message: `Using named and default exports together. Consumers of your bundle will have to use bundle['default'] to access the default export, which may not be what you want. Use \`exports: 'named'\` to disable this warning`,
			url: `https://github.com/rollup/rollup/wiki/JavaScript-API#exports`
		}
	]
};
