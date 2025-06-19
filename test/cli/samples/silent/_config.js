const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not print logs with --silent',
	spawnArgs: ['--config', '--silent'],
	stderr: stderr => {
		assert.equal(stderr, '');
		return true;
	}
});
