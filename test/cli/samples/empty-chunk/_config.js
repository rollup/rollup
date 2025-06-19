const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'shows warning when chunk empty',
	spawnArgs: ['-c'],
	error: () => true,
	stderr: stderr => assertIncludes(stderr, '(!) Generated an empty chunk\n"main"')
});
