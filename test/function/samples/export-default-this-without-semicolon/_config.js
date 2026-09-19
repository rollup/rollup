const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description:
		'adds the missing semicolon after a default export of a rewritten top-level "this" without a trailing semicolon',
	options: {
		output: { compact: true }
	},
	warnings: [
		{
			code: 'THIS_IS_UNDEFINED',
			id: path.join(__dirname, 'main.js'),
			message: `main.js (1:15): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten`,
			pos: 15,
			loc: {
				file: path.join(__dirname, 'main.js'),
				line: 1,
				column: 15
			},
			frame: `
				1: export default this
				                  ^
			`,
			url: `https://rollupjs.org/troubleshooting/#error-this-is-undefined`
		}
	],
	exports(exports) {
		assert.strictEqual(exports, undefined);
	}
});
