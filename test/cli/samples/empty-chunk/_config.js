const { assertIncludes } = require('../../../utils.js');

module.exports = defineRollupTest({
	description: 'shows warning when chunk empty',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => assertIncludes(stderr, '(!) Generated an empty chunk\n"main"')
});
