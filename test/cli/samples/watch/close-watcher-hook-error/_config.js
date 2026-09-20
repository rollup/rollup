const assert = require('node:assert/strict');
const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'reports closeWatcher hook errors without changing the exit code',
	spawnArgs: ['-cw'],
	// On Windows, signals terminate the process directly, so the graceful shutdown path is never taken.
	skipIfWindows: true,
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	},
	after(error) {
		assert.equal(error, undefined);
	},
	stderr(stderr) {
		assertIncludes(stderr, 'close watcher failed');
		assert.equal(stderr.split('close watcher failed').length - 1, 1);
	}
});
