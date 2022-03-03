const assert = require('assert');
const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'does not swallow errors on unfulfilled hooks actions',
	minNodeVersion: 13,
	command: 'node build.mjs',
	after(err) {
		// exit code check has to be here as error(err) is only called upon failure
		assert.strictEqual(err && err.code, 1);
	},
	error() {
		// do not abort test upon error
		return true;
	},
	stderr(stderr) {
		assertIncludes(stderr, '[!] Error: unfinished hook action(s) on exit');
		assertIncludes(stderr, '(test) transform');
		assertIncludes(stderr, 'Error: Error must be displayed.');
	}
};
