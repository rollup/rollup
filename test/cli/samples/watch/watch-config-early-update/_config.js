const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../../utils');

let configFile;

module.exports = {
	repeat: 100,
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		// This test writes a config file that prints a message to stderr but delays resolving to a
		// config. The stderr message is  observed by the parent process and triggers overwriting the
		// config file. That way, we simulate a complicated config file being changed while it is parsed.
		fs.mkdirSync(path.resolve(__dirname, '_actual'));
		configFile = path.resolve(__dirname, 'rollup.config.js');
		atomicWriteFileSync(
			configFile,
			`
			console.error('initial');
      export default new Promise(resolve => {
        setTimeout(
          () =>
            resolve({
              input: 'main.js',
              output: {
                file: '_actual/output1.js',
                format: 'es'
              }
            }),
          4000
        );
      });`
		);
		console.error('** first config file written.');
	},
	after() {
		fs.unlinkSync(configFile);
	},
	abortOnStderr(data) {
		console.error('*** abortOnStderr data:', JSON.stringify(data));
		if (data.includes('initial')) {
			atomicWriteFileSync(
				configFile,
				`
				console.error('updated');
		    export default {
          input: 'main.js',
		      output: {
            file: '_actual/output2.js',
		        format: "es"
		      }
		    };
		    `
			);
			console.error('** second config file written.');
			return false;
		}
		if (data.includes(`created _actual${path.sep}output2.js`)) {
			return new Promise(resolve => setTimeout(() => resolve(true), 1000));
		}
	}
};
