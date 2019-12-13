const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'shows warning when multiple chunks empty',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => assertStderrIncludes(stderr, '(!) Generated empty chunks\na, b')
};
