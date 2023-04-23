const assert = require('node:assert');
const { assertDoesNotInclude } = require('../../../utils');
const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description:
		'does not show unfulfilled hook actions when exiting manually with a non-zero exit code',
	command: 'rollup -c --silent',
	after(error) {
		assert.strictEqual(error && error.code, 1);
	},
	error() {
		// do not abort test upon error
		return true;
	},
	stderr(stderr) {
		assertDoesNotInclude(stderr, 'Unfinished');
		assertIncludes(stderr, 'Manual exit');
	}
});
