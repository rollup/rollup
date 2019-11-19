const assert = require('assert');

module.exports = {
	description: 'shows warning when multiple chunks empty',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => {
		assert.ok(stderr.includes('(!) Generated empty chunks\na, b'));
	}
};
