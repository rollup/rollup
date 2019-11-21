const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns when eval is used or there is a missing global variable name',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'(!) Missing global variable names\n' +
				'Use output.globals to specify browser global variable names corresponding to external modules\n' +
				"external1 (guessing 'foo1')\n" +
				"external2 (guessing 'foo2')\n" +
				"external3 (guessing 'foo3')\n" +
				'(!) Use of eval is strongly discouraged\n' +
				'https://rollupjs.org/guide/en/#avoiding-eval\n' +
				'dep1.js\n' +
				'1: eval(\'console.log("Hello");\');\n' +
				'   ^\n' +
				'dep2.js\n' +
				'1: eval(\'console.log("Hello");\');\n' +
				'   ^\n' +
				'2: eval(\'console.log("Hello again");\');\n' +
				'...and 1 other occurrence\n' +
				'dep3.js\n' +
				'1: eval(\'console.log("Hello");\');\n' +
				'   ^\n' +
				'2: eval(\'console.log("Hello again");\');\n' +
				'3: eval(\'console.log("Hello again and again");\');\n' +
				'...and 2 other occurrences\n' +
				'\n' +
				'...and 3 other files\n' +
				'(!) `this` has been rewritten to `undefined`\n' +
				'https://rollupjs.org/guide/en/#error-this-is-undefined\n' +
				'main.js\n' +
				" 8: import './dep5.js';\n" +
				' 9: \n' +
				'10: console.log(foo1, foo2, foo3, this, this, this, this, this, this);\n' +
				'                                  ^\n' +
				"11: export const bar = eval('foo');\n" +
				'...and 5 other occurrences'
		)
};
