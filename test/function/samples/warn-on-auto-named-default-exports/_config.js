const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns if default and named exports are used in auto mode',
	warnings: [
		{
			code: 'MIXED_EXPORTS',
			id: ID_MAIN,
			message:
				'Entry module "main.js" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.',
			url: 'https://rollupjs.org/configuration-options/#output-exports'
		}
	]
});
