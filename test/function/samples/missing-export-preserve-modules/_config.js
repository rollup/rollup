const path = require('node:path');

module.exports = defineTest({
	description: 'supports shimming missing exports when preserving modules',
	options: {
		shimMissingExports: true,
		output: {
			preserveModules: true
		}
	},
	warnings: [
		{
			binding: 'bar',
			code: 'SHIMMED_EXPORT',
			exporter: path.join(__dirname, 'foo.js'),
			message: 'Missing export "bar" has been shimmed in module "foo.js".'
		}
	]
});
