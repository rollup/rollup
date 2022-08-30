const assert = require('assert');
const { assertIncludes, assertDoesNotInclude } = require('../../../utils.js');

module.exports = {
	description: 'does not show unfulfilled hook actions if there are errors',
	command: 'node build.mjs',
	after(err) {
		// exit code check has to be here as error(err) is only called upon failure
		assert.strictEqual(err, null);
	},
	stderr(stderr) {
		assertIncludes(stderr, 'Error: Error must be displayed.');
		assertDoesNotInclude(stderr, 'Unfinished');
	}
};
