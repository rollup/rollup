const assert = require('assert');

module.exports = {
	description: 'functions marked with pure comment do not have effects',
	context: {
		require(id) {
			if (id === 'socks') {
				return () => '🧦';
			}
		}
	},
	code(code) {
		assert.ok(code.search(/socks\(\)/) === -1);
	},
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			message:
				"'socks' is imported by main.js, but could not be resolved – treating it as an external dependency",
			source: 'socks',
			url:
				'https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency'
		}
	]
};
