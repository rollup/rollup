const assert = require('node:assert');

module.exports = defineTest({
	description: 'triggers onwarn with --silent',
	spawnArgs: ['-c', '--silent'],
	stderr: stderr => {
		assert.equal(stderr, '');
		return true;
	}
});
