const path = require('node:path');
const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'warns on top-level this (#770)',
	warnings: [
		{
			code: 'THIS_IS_UNDEFINED',
			id: path.join(__dirname, 'main.js'),
			message: `main.js (3:0): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten`,
			pos: 81,
			loc: {
				file: path.join(__dirname, 'main.js'),
				line: 3,
				column: 0
			},
			frame: `
				1: const someVariableJustToCheckOnCorrectLineNumber = true; // eslint-disable-line
				2:
				3: this.foo = 'bar';
				   ^
			`,
			url: `https://rollupjs.org/troubleshooting/#error-this-is-undefined`
		}
	],
	runtimeError: error => {
		assertIncludes(error.message, 'Cannot set propert');
		assertIncludes(error.message, "'foo'");
	}
});
