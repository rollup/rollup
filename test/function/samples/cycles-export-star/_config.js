const assert = require('assert');

module.exports = {
	description: 'does not stack overflow on `export * from X` cycles',
	code(code) {
		assert.equal(
			code,
			`'use strict';\n\nfunction b() {\n\treturn 'b';\n}\n\nassert.equal(b(), 'b');\n`
		);
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'a.js',
			message: 'Circular dependency: a.js -> b.js -> a.js'
		}
	]
};
