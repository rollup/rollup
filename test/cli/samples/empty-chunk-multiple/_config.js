const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'shows warning when multiple chunks empty',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => assertIncludes(stderr, '(!) Generated empty chunks\n"a" and "b"')
});
