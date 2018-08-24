const assert = require('assert');

module.exports = {
	description: 'errors with code frames should also log error\'s stack',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => {
		assert.ok(/custom code frame/.test(stderr));
		assert.ok(/ at /.test(stderr));
		assert.ok(/\.[a-z]+:\d+:\d+\)?\n/i.test(stderr));
	}
};
