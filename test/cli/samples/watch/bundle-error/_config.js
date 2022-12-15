const { unlinkSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { atomicWriteFileSync } = require('../../../../utils');

let mainFile;

module.exports = {
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
		// trigger this when the stack trace is written
		if (data.includes('at error')) {
			console.log('TRIGGER WRITE FILE');
			setTimeout(() => {
				console.log('ACTUAL WRITE');
				atomicWriteFileSync(mainFile, 'export default 42;');
			}, 500);
			return false;
		} else if (data.includes('created _actual')) {
			console.log('DONE');
			return true;
		} else {
			console.log('NO TRIGGER:', data);
		}
	}
};
