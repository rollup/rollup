const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'flushes large warnings before forcing exit with large stdout output',
	spawnArgs: ['--config', 'rollup.config.js', '--forceExit'],
	stderr(stderr) {
		assert.ok(stderr.includes('warning-start' + 'x'.repeat(2 ** 20) + 'warning-end'));
		return true;
	},
	result(stdout) {
		assert.strictEqual(stdout, `console.log(${JSON.stringify('x'.repeat(2 ** 20))});\n`);
	}
});
