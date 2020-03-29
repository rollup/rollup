const assert = require('assert');

const CLEAR_SCREEN = '\u001bc';
const UNDERLINE = '\u001b[4m';
const NO_UNDERLINE = '\u001b[24m';

module.exports = {
	description: 'clears the screen before bundling',
	command: 'node wrapper.js -cw',
	env: { FORCE_COLOR: '1', TERM: 'xterm' },
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	},
	stderr(stderr) {
		assert.strictEqual(
			stderr.slice(0, 25),
			`${CLEAR_SCREEN}${UNDERLINE}rollup v2.2.0${NO_UNDERLINE}\n`
		);
	},
};
