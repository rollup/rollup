const assert = require('assert');

module.exports = {
	description: 'does not hang on missing module (#53)',
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			source: 'unlessYouCreatedThisFileForSomeReason',
			message: `'unlessYouCreatedThisFileForSomeReason' is imported by main.js, but could not be resolved – treating it as an external dependency`,
			url: `https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency`
		}
	],
	runtimeError(error) {
		assert.equal(
			error.message.split('\n')[0],
			"Cannot find module 'unlessYouCreatedThisFileForSomeReason'"
		);
	}
};
