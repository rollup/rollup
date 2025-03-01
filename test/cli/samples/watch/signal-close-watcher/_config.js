const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'calls closeWatcher plugin hooks when rollup is terminated due to a signal',
	spawnArgs: ['-cw'],
	skipIfWindows: true,
	abortOnStderr(data) {
		if (data.includes('created _actual')) {
			return true;
		}
	},
	stderr(stderr) {
		assertIncludes(stderr, 'close first\nclose second');
	}
});
