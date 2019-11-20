const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'shows warning when chunk empty',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => assertStderrIncludes(stderr, '(!) Generated an empty chunk\nmain')
};
