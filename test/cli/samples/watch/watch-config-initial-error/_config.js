const fs = require('fs');
const path = require('path');

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
			fs.writeFileSync(
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
			// Handle a race condition where the output cannot be accessed on disk yet
			for (let i = 0; i < 5; i++) {
				try {
					fs.accessSync(path.join(__dirname, '_actual'));
					break;
				} catch (e) {
					await new Promise(fulfil => setTimeout(fulfil, 50));
				}
			}
			return true;
		}
	}
};
