const assert = require('node:assert');
const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'show errors with non-zero exit code for unfulfilled async plugin actions on exit',
	spawnArgs: ['-c', '--silent'],
	after(error) {
		// exit code check has to be here as error(err) is only called upon failure
		assert.strictEqual(error && error.code, 1);
	},
	error() {
		// do not abort test upon error
		return true;
	},
	stderr(stderr) {
		console.error(stderr);
		assertIncludes(
			stderr,
			'Error: Unexpected early exit. This happens when Promises returned by plugins cannot resolve. Unfinished hook action(s) on exit:'
		);

		// these unfulfilled async hook actions may occur in random order
		assertIncludes(stderr, '(buggy-plugin) resolveId "./c.js" "main.js"');
		assertIncludes(stderr, '(buggy-plugin) load "./b.js"');
		assertIncludes(stderr, '(buggy-plugin) transform "./a.js"');
		assertIncludes(stderr, '(buggy-plugin) moduleParsed "./d.js"');
		assertIncludes(stderr, '(buggy-plugin) shouldTransformCachedModule "./e.js"');
	}
});
