const { unlinkSync, writeFileSync } = require('fs');
const path = require('path');

let mainFile;

module.exports = {
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
			setTimeout(() => writeFileSync(mainFile, 'export default 42;'), 600);
		}
	}
};
