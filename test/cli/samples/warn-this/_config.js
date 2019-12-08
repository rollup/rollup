const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns "this" is used on the top level',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'(!) `this` has been rewritten to `undefined`\n' +
				'https://rollupjs.org/guide/en/#error-this-is-undefined\n' +
				'main.js\n' +
				'1: console.log(this);\n' +
				'               ^'
		)
};
