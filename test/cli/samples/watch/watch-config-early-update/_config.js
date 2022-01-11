const fs = require('fs');
const path = require('path');
const { writeAndSync } = require('../../../../utils');

let configFile;

module.exports = {
	repeat: 100,
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		// This test writes a config file that prints a message to stderr but delays resolving to a
		// config. The stderr message is  observed by the parent process and triggers overwriting the
		// config file. That way, we simulate a complicated config file being changed while it is parsed.
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(
			configFile,
			`
		  import { watch } from 'fs';
      export default new Promise(resolve => {
				const watcher = watch(${JSON.stringify(configFile)}, () => {
				  console.error('config update detected');
				  watcher.close();
				  setTimeout(() => {
				    console.error('resolve original config');
				    resolve({
              input: 'main.js',
              output: {
                file: '_actual/output1.js',
                format: 'es'
              }
            })
          // wait a moment to make sure we do not trigger before Rollup's watcher
          }, 600)
				});
				console.error('initial');
      });
  		`
		);
	},
	after() {
		fs.unlinkSync(configFile);
	},
	abortOnStderr(data) {
		console.log('data:', data);
		if (data === 'initial\n') {
			writeAndSync(
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
			return false;
		}
		if (data.includes(`created _actual${path.sep}output2.js`)) {
			return new Promise(resolve => setTimeout(() => resolve(true), 600));
		}
	}
};
