const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'warns "this" is used on the top level',
	command: 'rollup -c',
	stderr: stderr =>
		assertIncludes(
			stderr,
			'(!) "this" has been rewritten to "undefined"\n' +
				'https://rollupjs.org/troubleshooting/#error-this-is-undefined\n' +
				'main.js\n' +
				'1: console.log(this);\n' +
				'               ^'
		)
});
