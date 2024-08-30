const { assertIncludes } = require('../../../../utils.js');

module.exports = defineTest({
	description: 'calls closeWatcher plugin hooks when rollup is terminated due to a signal',
	command: 'rollup -cw',
	abortOnStderr(data) {
		if (data.includes('created _actual')) {
			return true;
		}
	},
	stderr(stderr) {
		assertIncludes(stderr, 'close first\nclose second');
	}
});
