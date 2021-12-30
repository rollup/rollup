const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../utils');

let second;
let third;

module.exports = {
	description: 'waits for multiple named bundle inputs',
	command: 'rollup -c --waitForBundleInput',
	before() {
		second = path.resolve(__dirname, 'second.js');
		third = path.resolve(__dirname, 'third.js');
	},
	after() {
		fs.unlinkSync(second);
		fs.unlinkSync(third);
	},
	abortOnStderr(data) {
		if (data.includes('waiting for input second')) {
			atomicWriteFileSync(second, "export default 'second'");
		} else if (data.includes('waiting for input third')) {
			atomicWriteFileSync(third, "export default 'third'");
		}
	}
};
