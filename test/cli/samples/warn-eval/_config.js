const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns when eval is used',
	command: 'rollup -c',
	stderr: stderr =>
		assertIncludes(
			stderr,
			'(!) Use of eval is strongly discouraged\n' +
				'https://rollupjs.org/guide/en/#avoiding-eval\n' +
				'main.js\n' +
				"1: eval('foo');\n" +
				'   ^'
		)
};
