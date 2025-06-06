const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	solo: true,
	repeat: 20,
	description: 'onError event hook shell commands write to stderr',
	spawnScript: 'wrapper.js',
	spawnArgs: ['-cw', '--watch.onError', 'echo error'],
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			console.log('ABORTING on stderr:', data, '======');
			return true;
		} else {
			console.log('NOT aborting on stderr:', data, '======');
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
