const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'batches warnings when eval is used multiple times',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
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
				'...and 3 other files'
		)
};
