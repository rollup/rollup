const assert = require('node:assert');

const UNDERLINE = '\u001B[4m';

module.exports = defineTest({
	description: 'allows disabling clearing the screen',
	spawnScript: 'wrapper.js',
	spawnArgs: ['-cw'],
	env: { FORCE_COLOR: '1', TERM: 'xterm' },
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	},
	stderr(stderr) {
		assert.strictEqual(stderr.slice(0, 10), `${UNDERLINE}rollup`);
	}
});
