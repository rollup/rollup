const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'exits the process naturally when terminated by a signal',
	spawnArgs: ['-cw'],
	// On Windows, signals terminate the process directly, so the graceful shutdown path is never taken.
	skipIfWindows: true,
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	},
	stderr(stderr) {
		assertIncludes(stderr, 'exited naturally');
	}
});
