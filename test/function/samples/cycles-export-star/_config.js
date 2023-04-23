const assert = require('node:assert');
const path = require('node:path');
const ID_A = path.join(__dirname, 'a.js');
const ID_B = path.join(__dirname, 'b.js');

module.exports = defineTest({
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
			ids: [ID_A, ID_B, ID_A],
			message: 'Circular dependency: a.js -> b.js -> a.js'
		}
	]
});
