const fs = require('fs');
const path = require('path');

let configFile;
let reloadTriggered = false;

module.exports = {
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		fs.mkdirSync(path.resolve(__dirname, '_actual'));
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(
			configFile,
			`
      export default new Promise(resolve => {
        setTimeout(
          () =>
            resolve({
              input: { output1: 'main.js' },
              output: {
                dir: '_actual',
                format: 'es'
              }
            }),
          600
        );
      });
  		`
		);
		setTimeout(() => {
			fs.writeFileSync(
				configFile,
				`
		          export default {
		            input: {output2: "main.js"},
		            output: {
		              dir: "_actual",
		              format: "es"
		            }
		          };
		        `
			);
		}, 300);
	},
	after() {
		fs.unlinkSync(configFile);
	},
	abortOnStderr(data) {
		if (reloadTriggered && data.includes('created _actual')) {
			return new Promise(resolve => setTimeout(() => resolve(true), 500));
		} else if (data.includes('Reloading updated config')) {
			reloadTriggered = true;
			return false;
		}
	}
};
