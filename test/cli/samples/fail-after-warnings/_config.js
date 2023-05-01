const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'errors on warnings with --failAfterWarnings',
	command: 'rollup -i main.js --failAfterWarnings',
	error: () => true,
	stderr: stderr => {
		assertIncludes(stderr, '[!] Warnings occurred and --failAfterWarnings flag present');
		return true;
	}
});
