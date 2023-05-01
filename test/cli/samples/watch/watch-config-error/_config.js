const { unlinkSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { atomicWriteFileSync } = require('../../../../utils');

let configFile;

module.exports = defineTest({
	description: 'keeps watching the config file in case the config is changed to an invalid state',
	command: 'rollup -cw',
	before() {
		configFile = path.resolve(__dirname, 'rollup.config.mjs');
		writeFileSync(
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
		// synchronous sometimes does not seem to work, probably because the watch is not yet removed properly
		setTimeout(() => unlinkSync(configFile), 300);
	},
	abortOnStderr(data) {
		if (data.includes(`created _actual/main1.js`)) {
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
		if (data.includes(`created _actual/main2.js`)) {
			return true;
		}
	}
});
