const fs = require('fs');
const path = require('path');
const { writeAndSync } = require('../../../../utils');

let configFile;

module.exports = {
	solo: true,
	repeat: 100,
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		// This test writes a config file that prints a message to stderr but delays resolving to a
		// config. The stderr message is  observed by the parent process and triggers overwriting the
		// config file. That way, we simulate a complicated config file being changed while it is parsed.
		configFile = path.resolve(__dirname, 'rollup.config.js');
		console.time('testTime');
		writeAndSync(
			configFile,
			`
		  import { watch } from 'fs';
		  let watcher;
		  
		  // Sometimes, fs.watch does not seem to trigger on MacOS. Thus, we wait at most 5 seconds.
      export default Promise.race([
        new Promise(resolve => {
		      watcher = watch(${JSON.stringify(configFile)}, () => {
			  	  console.error('config update detected');
			  	  watcher.close();
			  	  watcher = null;
            // wait a moment to make sure we do not trigger before Rollup's watcher
			  	  setTimeout(resolve, 600);
			  	})
		    }),
		    new Promise(resolve => setTimeout(() => {
		      if (watcher) {
		        watcher.close();
		      };
		      resolve();
		    }, 5000))
      ]).then(() => ({
        input: 'main.js',
        output: {
          file: '_actual/output1.js',
          format: 'es'
        }
      }));
			console.error('initial');
  		`
		);
		return new Promise(resolve => setTimeout(resolve, 600));
	},
	after() {
		console.timeEnd('testTime');
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
