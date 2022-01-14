const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../../utils');

let configFile;

module.exports = {
	description: 'keeps watching the config file in case the config is changed to an invalid state',
	command: 'rollup -cw',
	before() {
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(
			configFile,
			`
			export default {
			  input: "main.js",
        output: {
          file: "_actual/main1.js",
          format: "es"
        }
      };`
		);
	},
	after() {
		fs.unlinkSync(configFile);
	},
	abortOnStderr(data) {
		if (data.includes(`created _actual${path.sep}main1.js`)) {
			setTimeout(
				() => atomicWriteFileSync(configFile, 'throw new Error("Config contains errors");'),
				600
			);
			return false;
		}
		if (data.includes('Config contains errors')) {
			setTimeout(() => {
				atomicWriteFileSync(
					configFile,
					'export default {\n' +
						'\tinput: "main.js",\n' +
						'\toutput: {\n' +
						'\t\tfile: "_actual/main2.js",\n' +
						'\t\tformat: "es"\n' +
						'\t}\n' +
						'};'
				);
			}, 600);
			return false;
		}
		if (data.includes(`created _actual${path.sep}main2.js`)) {
			return true;
		}
	}
};
