const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'errors on warnings with --failAfterWarnings',
	spawnArgs: ['-i', 'main.js', '--failAfterWarnings'],
	error: () => true,
	stderr: stderr => {
		assertIncludes(stderr, '[!] Warnings occurred and --failAfterWarnings flag present');
		return true;
	}
});
