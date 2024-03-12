const { unlinkSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { atomicWriteFileSync } = require('../../../../utils');

let mainFile;

module.exports = defineTest({
	description: 'recovers from errors during bundling',
	command: 'rollup -cw --bundleConfigAsCjs',
	before() {
		mainFile = path.resolve(__dirname, 'main.js');
		writeFileSync(mainFile, '<=>');
	},
	after() {
		// synchronous sometimes does not seem to work, probably because the watch is not yet removed properly
		setTimeout(() => unlinkSync(mainFile), 300);
	},
	abortOnStderr(data) {
		if (data.includes('[!] RollupError: main.js (1:0): Expression expected')) {
			setTimeout(() => atomicWriteFileSync(mainFile, 'export default 42;'), 500);
			return false;
		}
		if (data.includes('created _actual')) {
			return true;
		}
	}
});
