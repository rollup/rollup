const assert = require('assert');
const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'show errors with non-zero exit code for unfulfilled async plugin actions on exit',
	command: 'rollup main.js -p ./buggy-plugin.js --silent',
	after(err) {
		// exit code check has to be here as error(err) is only called upon failure
		assert.strictEqual(err && err.code, 1);
	},
	error(err) {
		// do not abort test upon error
		return true;
	},
	stderr(stderr) {
		assertIncludes(stderr, '[!] Error: unfinished hook action(s) on exit');

		// these unfulfilled async hook actions may occur in random order
		assertIncludes(stderr, '(buggy-plugin) resolveId "./c.js" "main.js"');
		assertIncludes(stderr, '(buggy-plugin) load "./b.js"');
		assertIncludes(stderr, '(buggy-plugin) transform "./a.js"');
		assertIncludes(stderr, '(buggy-plugin) moduleParsed');
	}
};
