const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'warns when there is a missing global variable name',
	command: 'rollup -c',
	stderr: stderr =>
		assertStderrIncludes(
			stderr,
			'(!) Missing global variable name\n' +
				'Use output.globals to specify browser global variable names corresponding to external modules\n' +
				"external (guessing 'foo')"
		)
};
