const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'flushes pending diagnostics before forcing exit',
	spawnArgs: ['--config', '--forceExit'],
	stderr(stderr) {
		assert.match(stderr, /Deferred CLI warning/);
		return false;
	}
});
