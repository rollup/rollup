const path = require('path');

module.exports = {
	description: 'warns on unused imports ([#595])',
	options: {
		external: ['external']
	},
	context: {
		require() {
			return {};
		}
	},
	warnings: [
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			source: 'external',
			names: ['notused', 'neverused'],
			message: `"notused" and "neverused" are imported from external module "external" but never used in "main.js".`,
			sources: [path.resolve(__dirname, './main.js')]
		}
	]
};
