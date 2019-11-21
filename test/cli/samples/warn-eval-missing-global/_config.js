const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns when eval is used or there is a missing global variable name',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'(!) Missing global variable name\n' +
				'Use output.globals to specify browser global variable names corresponding to external modules\n' +
				"external (guessing 'foo')\n" +
				'(!) Use of eval is strongly discouraged\n' +
				'https://rollupjs.org/guide/en/#avoiding-eval\n' +
				'main.js\n' +
				"1: import foo from 'external';\n" +
				'2: console.log(foo, this);\n' +
				"3: export const bar = eval('foo');\n" +
				'                      ^\n' +
				'(!) `this` has been rewritten to `undefined`\n' +
				'https://rollupjs.org/guide/en/#error-this-is-undefined\n' +
				'main.js\n' +
				"1: import foo from 'external';\n" +
				'2: console.log(foo, this);\n' +
				'                    ^\n' +
				"3: export const bar = eval('foo');"
		)
};
