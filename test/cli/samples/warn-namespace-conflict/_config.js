const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns when there are conflicting namespaces',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'(!) Conflicting re-exports\n' +
				"main.js re-exports 'foo' from both dep1.js and dep2.js (will be ignored)\n" +
				"main.js re-exports 'bar' from both dep1.js and dep2.js (will be ignored)"
		)
};
