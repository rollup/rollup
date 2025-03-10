const assert = require('node:assert');
const { assertIncludes, assertDoesNotInclude, hasEsBuild } = require('../../../testHelpers.js');

module.exports = defineTest({
	skip: !hasEsBuild,
	description: 'does not show unfulfilled hook actions if there are errors',
	command: 'node build.mjs',
	after(error) {
		// exit code check has to be here as error(err) is only called upon failure
		assert.strictEqual(error, undefined);
	},
	stderr(stderr) {
		assertIncludes(stderr, 'Error: Error must be displayed.');
		assertDoesNotInclude(stderr, 'Unfinished');
	}
});
