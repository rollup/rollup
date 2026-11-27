const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'flushes large asset output before forcing exit with open handles',
	spawnArgs: ['--config', 'rollup.config.js', '--forceExit', '--silent'],
	result(stdout) {
		assert.ok(stdout.endsWith('x'.repeat(2 ** 20)));
	}
});
