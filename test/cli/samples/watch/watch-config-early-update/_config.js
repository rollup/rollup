const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../../utils');

let configFile;

module.exports = {
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		fs.mkdirSync(path.resolve(__dirname, '_actual'));
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(
			configFile,
			`
			console.error('initial');
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
          1000
        );
      });
  		`
		);
	},
	after() {
		fs.unlinkSync(configFile);
	},
	abortOnStderr(data) {
		if (data === 'initial\n') {
			atomicWriteFileSync(
				configFile,
				`
				console.error('updated');
		    export default {
		      input: {output2: "main.js"},
		      output: {
		        dir: "_actual",
		        format: "es"
		      }
		    };
		    `
			);
			return false;
		}
		if (data === 'updated\n') {
			return new Promise(resolve => setTimeout(() => resolve(true), 500));
		}
	}
};
