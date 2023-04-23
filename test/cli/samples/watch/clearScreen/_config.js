const assert = require('node:assert');

const CLEAR_SCREEN = '\u001Bc';
const UNDERLINE = '\u001B[4m';

module.exports = defineRollupTest({
	description: 'clears the screen before bundling',
	command: 'node wrapper.js -cw',
	env: { FORCE_COLOR: '1', TERM: 'xterm' },
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			return true;
		}
	},
	stderr(stderr) {
		assert.strictEqual(stderr.slice(0, 12), `${CLEAR_SCREEN}${UNDERLINE}rollup`);
	}
});
