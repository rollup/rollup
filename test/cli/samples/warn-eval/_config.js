const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'warns when eval is used',
	command: 'rollup -c',
	stderr: stderr =>
		assertIncludes(
			stderr,
			'(!) Use of eval is strongly discouraged\n' +
				'https://rollupjs.org/troubleshooting/#avoiding-eval\n' +
				'main.js\n' +
				"1: eval('foo');\n" +
				'   ^'
		)
});
