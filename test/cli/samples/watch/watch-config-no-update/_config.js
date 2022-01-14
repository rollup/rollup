const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../../utils');

let configFile;
const configContent =
	'export default {\n' +
	'\tinput: "main.js",\n' +
	'\toutput: {\n' +
	'\t\tfile: "_actual/main.js",\n' +
	'\t\tformat: "es"\n' +
	'\t}\n' +
	'};';

module.exports = {
	description: 'does not rebuild if the config file is updated without change',
	command: 'rollup -cw',
	before() {
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(configFile, configContent);
	},
	after() {
		fs.unlinkSync(configFile);
	},
	abortOnStderr(data) {
		if (data.includes(`created _actual${path.sep}main.js`)) {
			atomicWriteFileSync(configFile, configContent);
			// wait some time for the watcher to trigger
			return new Promise(resolve => setTimeout(() => resolve(true), 600));
		}
	},
	stderr(stderr) {
		if (
			!/^rollup v\d+\.\d+\.\d+(-\d+)?\nbundles main.js → _actual[\\/]main.js...\ncreated _actual[\\/]main.js in \d+ms\n$/.test(
				stderr
			)
		) {
			throw new Error(`stderr output does not match: ${JSON.stringify(stderr)}`);
		}
	}
};
