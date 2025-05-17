const { unlinkSync } = require('node:fs');
const path = require('node:path');
const { atomicWriteFileSync } = require('../../../testHelpers');

let second;
let third;

module.exports = defineTest({
	description: 'waits for multiple named bundle inputs',
	spawnArgs: ['-c', '--waitForBundleInput'],
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
			atomicWriteFileSync(second, "export default 'second'");
		} else if (data.includes('waiting for input third')) {
			atomicWriteFileSync(third, "export default 'third'");
		}
	}
});
