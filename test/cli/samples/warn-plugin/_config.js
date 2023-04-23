const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'displays warnings from plugins',
	command: 'rollup -c',
	stderr: stderr =>
		assertIncludes(
			stderr,
			'(!) Plugin test-plugin: First\n' +
				'(!) Plugin test-plugin: Second\n' +
				'https://information\n' +
				'(!) Plugin second-plugin: Third\n' +
				'other.js\n' +
				'(!) Plugin second-plugin: Fourth\n' +
				'other.js: (1:2)\n' +
				'custom frame'
		)
});
