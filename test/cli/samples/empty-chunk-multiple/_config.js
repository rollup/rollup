const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'shows warning when multiple chunks empty',
	spawnArgs: ['-c'],
	error: () => true,
	stderr: stderr => assertIncludes(stderr, '(!) Generated empty chunks\n"main1" and "main2"')
});
