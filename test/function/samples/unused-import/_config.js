const assert = require('assert');

module.exports = {
	description: 'warns on unused imports ([#595])',
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			source: 'external',
			message: `'external' is imported by main.js, but could not be resolved – treating it as an external dependency`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency`
		},
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			source: 'external',
			names: ['unused', 'notused', 'neverused'],
			message: `'unused', 'notused' and 'neverused' are imported from external module 'external' but never used`
		}
	]
};
