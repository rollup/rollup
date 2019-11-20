const assert = require('assert');

module.exports = {
	description: 'shows warning when chunk empty',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => {
		assert.ok(stderr.includes('(!) Generated an empty chunk\nmain'));
	}
};
