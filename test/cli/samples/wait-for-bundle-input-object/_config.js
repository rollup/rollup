const { unlinkSync, writeFileSync } = require('fs');
const path = require('path');

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
		unlinkSync(second);
		unlinkSync(third);
	},
	abortOnStderr(data) {
		if (data.includes('waiting for input second')) {
			writeFileSync(second, "export default 'second'");
		} else if (data.includes('waiting for input third')) {
			writeFileSync(third, "export default 'third'");
		}
	}
};
