var assert = require('assert');

module.exports = {
	description: 'cycles work with default exports',
	options: {
		ignoreWarnings: [],
	},
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			source: 'unlessYouCreatedThisFileForSomeReason',
			message: `'unlessYouCreatedThisFileForSomeReason' is imported by main.js, but could not be resolved – treating it as an external dependency`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency`
		},
		{
			code: "CIRCULAR_DEPENDENCY",
			importer: "a.js",
			message: "Circular dependency: a.js -> b.js -> a.js",
		}
	],
	runtimeError: function(error) {
		assert.equal("Cannot find module 'unlessYouCreatedThisFileForSomeReason'", error.message);
	}
};
