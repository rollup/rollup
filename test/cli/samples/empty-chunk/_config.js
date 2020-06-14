const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'shows warning when chunk empty',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => assertIncludes(stderr, '(!) Generated an empty chunk\nmain')
};
