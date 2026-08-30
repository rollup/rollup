const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'avoids exponential memory usage when repeatedly calling a multi-return function',
	env: { NODE_OPTIONS: '--max-old-space-size=64' },
	execute: true,
	spawnArgs: ['main.js', '--format', 'cjs', '--silent'],
	stderr(errorOutput) {
		assert.equal(errorOutput, '');
		return true;
	}
});
