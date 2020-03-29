const fs = require('fs');
const path = require('path');

let configFile;
let currentlyBundling;

const updateConfigDelayed = (content) =>
	setTimeout(() => fs.writeFileSync(configFile, content), 100);

module.exports = {
	description: 'watches the config file',
	command: 'rollup -cw',
	before() {
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(configFile, 'throw new Error("Config contains initial errors");');
	},
	abortOnStderr(data) {
		if (data.includes('→ _actual')) {
			currentlyBundling = /bundles([^→]+)→ _actual/.exec(data)[1].trim();
			return false;
		}
		if (data.includes('Config contains initial errors')) {
			updateConfigDelayed(
				'export default {\n' +
					'\tinput: "main1.js",\n' +
					'\toutput: {\n' +
					'\t\tdir: "_actual",\n' +
					'\t\tformat: "es"\n' +
					'\t}\n' +
					'};'
			);
			return false;
		}
		if (data.includes('Config contains further errors')) {
			updateConfigDelayed(
				'export default {\n' +
					'\tinput: ["main2.js", "main3.js"],\n' +
					'\toutput: {\n' +
					'\t\tdir: "_actual",\n' +
					'\t\tformat: "es"\n' +
					'\t}\n' +
					'};'
			);
			return false;
		}
		if (data.includes('created _actual')) {
			switch (currentlyBundling) {
				case 'main1.js':
					updateConfigDelayed('throw new Error("Config contains further errors");');
					return false;
				case 'main2.js, main3.js':
					updateConfigDelayed(
						'export default {\n' +
							'\tinput: {output: "main4.js"},\n' +
							'\toutput: {\n' +
							'\t\tdir: "_actual",\n' +
							'\t\tformat: "es"\n' +
							'\t}\n' +
							'};'
					);
					return false;
				case 'main4.js':
					return true;
			}
		}
	},
};
