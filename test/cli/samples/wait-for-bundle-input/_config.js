const { unlinkSync } = require('node:fs');
const path = require('node:path');
const { atomicWriteFileSync } = require('../../../testHelpers');

let mainFile;

module.exports = defineTest({
	description: 'waits for bundle input',
	command: 'rollup -c --waitForBundleInput',
	before() {
		mainFile = path.resolve(__dirname, 'main.js');
	},
	after() {
		unlinkSync(mainFile);
	},
	abortOnStderr(data) {
		if (data.includes('waiting for input main.js')) {
			// wait longer than one polling interval
			setTimeout(() => atomicWriteFileSync(mainFile, 'export default 42;'), 600);
		}
		// We wait for a regular abort as we do not watch
		return false;
	}
});
