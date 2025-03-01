const { unlinkSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { atomicWriteFileSync } = require('../../../../testHelpers');

let configFile;

module.exports = defineTest({
	description: 'keeps watching the config file in case the initial file contains an error',
	retry: true,
	command: 'rollup -cw',
	before() {
		configFile = path.join(__dirname, 'rollup.config.mjs');
		writeFileSync(configFile, 'throw new Error("Config contains initial errors");');
	},
	after() {
		// synchronous sometimes does not seem to work, probably because the watch is not yet removed properly
		setTimeout(() => unlinkSync(configFile), 300);
	},
	async abortOnStderr(data) {
		if (data.includes('Config contains initial errors')) {
			await new Promise(resolve => setTimeout(resolve, 100));
			atomicWriteFileSync(
				configFile,
				'export default {\n' +
					'\tinput: "main.js",\n' +
					'\toutput: {\n' +
					'\t\tdir: "_actual",\n' +
					'\t\tformat: "es"\n' +
					'\t}\n' +
					'};'
			);
			return false;
		}
		if (data.includes('created _actual')) {
			return true;
		}
	}
});
