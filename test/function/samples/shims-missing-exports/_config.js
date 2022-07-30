const path = require('path');
const ID_DEP1 = path.join(__dirname, 'dep1.js');

module.exports = {
	description: 'shims missing exports',
	options: {
		shimMissingExports: true
	},
	warnings: [
		{
			binding: 'missing',
			code: 'SHIMMED_EXPORT',
			exporter: ID_DEP1,
			message: 'Missing export "missing" has been shimmed in module "dep1.js".'
		}
	]
};
