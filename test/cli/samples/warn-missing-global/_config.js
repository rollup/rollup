const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'warns when there is a missing global variable name',
	spawnArgs: ['-c'],
	stderr: stderr =>
		assertIncludes(
			stderr,
			'(!) Missing global variable name\n' +
				'https://rollupjs.org/configuration-options/#output-globals\n' +
				'Use "output.globals" to specify browser global variable names corresponding to external modules:\n' +
				'external (guessing "foo")'
		)
});
