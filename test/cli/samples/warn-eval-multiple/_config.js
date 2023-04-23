const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'warns when eval is used multiple times',
	command: 'rollup -c',
	stderr: stderr =>
		assertIncludes(
			stderr,
			'(!) Use of eval is strongly discouraged\n' +
				'https://rollupjs.org/troubleshooting/#avoiding-eval\n' +
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
				'...and 3 other files'
		)
});
