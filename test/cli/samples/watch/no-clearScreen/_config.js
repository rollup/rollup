const assert = require('assert');

const UNDERLINE = '\u001b[4m';

module.exports = {
	description: 'allows disabling clearing the screen',
	command: 'node wrapper.js -cw',
	env: { FORCE_COLOR: '1', TERM: 'xterm' },
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	},
	stderr(stderr) {
		assert.strictEqual(stderr.slice(0, 10), `${UNDERLINE}rollup`);
	}
};
