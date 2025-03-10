const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'custom (plugin generated) code frame taking priority over pos generated one',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr =>
		assertIncludes(
			stderr,
			'[!] (plugin at position 1) Error: My error.\n' + 'main.js (1:5)\n' + 'custom code frame\n'
		)
});
