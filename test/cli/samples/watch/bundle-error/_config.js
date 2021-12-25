const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../../utils');

let mainFile;

module.exports = {
	description: 'recovers from errors during bundling',
	command: 'rollup -cw',
	before() {
		mainFile = path.resolve(__dirname, 'main.js');
		fs.writeFileSync(mainFile, '<=>');
	},
	after() {
		// synchronous sometimes does not seem to work, probably because the watch is not yet removed properly
		setTimeout(() => fs.unlinkSync(mainFile), 300);
	},
	abortOnStderr(data) {
		if (data.includes('Error: Unexpected token')) {
			setTimeout(() => atomicWriteFileSync(mainFile, 'export default 42;'), 500);
			return false;
		}
		if (data.includes('created _actual')) {
			return true;
		}
	}
};
