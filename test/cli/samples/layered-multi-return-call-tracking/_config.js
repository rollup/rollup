const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'tracks layered multi-return call graphs without exponential overhead',
	env: { NODE_OPTIONS: '--max-old-space-size=128' },
	execute: true,
	spawnArgs: ['main.js', '--format', 'cjs', '--silent'],
	stderr(errorOutput) {
		assert.equal(errorOutput, '');
		return true;
	},
	after(_error, stdout) {
		assert.ok(stdout.includes("console.log('retained')"));
	}
});
