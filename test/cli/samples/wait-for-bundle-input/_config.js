const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../utils');

let mainFile;

module.exports = {
	description: 'waits for bundle input',
	command: 'rollup -c --waitForBundleInput',
	before() {
		mainFile = path.resolve(__dirname, 'main.js');
	},
	after() {
		fs.unlinkSync(mainFile);
	},
	abortOnStderr(data) {
		if (data.includes('waiting for input main.js')) {
			// wait longer than one polling interval
			setTimeout(() => atomicWriteFileSync(mainFile, 'export default 42;'), 600);
		}
		// We wait for a regular abort as we do not watch
		return false;
	}
};
