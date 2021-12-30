const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../../utils');

let configFile;

module.exports = {
	description: 'keeps watching the config file in case the initial file contains an error',
	command: 'rollup -cw',
	before() {
		configFile = path.join(__dirname, 'rollup.config.js');
		fs.writeFileSync(configFile, 'throw new Error("Config contains initial errors");');
	},
	after() {
		fs.unlinkSync(configFile);
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
};
