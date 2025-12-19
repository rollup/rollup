const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns on unused imports ([#595])',
	options: {
		external: ['external']
	},
	context: {
		require() {
			return {
				used: true
			};
		}
	},
	warnings: [
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			exporter: 'external',
			ids: [ID_MAIN],
			message: '"unused" is imported from external module "external" but never used in "main.js".',
			names: ['unused']
		}
	]
});
