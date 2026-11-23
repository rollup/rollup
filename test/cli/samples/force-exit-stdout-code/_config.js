const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'flushes large code output before forcing exit with open handles',
	spawnArgs: ['--config', 'rollup.config.js', '--forceExit', '--silent'],
	result(stdout) {
		assert.strictEqual(stdout, `console.log(${JSON.stringify('x'.repeat(2 ** 20))});\n`);
	}
});
