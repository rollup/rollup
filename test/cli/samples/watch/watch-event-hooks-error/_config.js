const { assertIncludes, wait } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'onError event hook shell commands write to stderr',
	spawnScript: 'wrapper.js',
	spawnArgs: ['-cw', '--watch.onError', 'echo error'],
	async abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			// Wait a little for the child process to complete the command
			await wait(300);
			return true;
		}
	},
	stderr(stderr) {
		assertIncludes(
			stderr,
			`watch.onError $ echo error
error`
		);
	}
});
