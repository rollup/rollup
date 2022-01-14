const fs = require('fs');
const path = require('path');
const { writeAndSync } = require('../../../../utils');

const configFile = path.join(__dirname, 'rollup.config.js');
let updateRetryTimeout;
let retries = 0;

module.exports = {
	repeat: 100,
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		// This test writes a config file that prints a message to stderr which signals to the test that
		// the config files has been parsed, at which point the test replaces the config file. The
		// initial file returns a Promise that only resolves once the second config file has been
		// parsed. To do that, the first config hooks into process.stderr and looks for a log from the
		// second config.
		// That way, we simulate a complicated config file being changed while it is parsed.
		fs.mkdirSync(path.join(__dirname, '_actual'));
		writeAndSync(
			configFile,
			`
			import { Writable } from 'stream';
			process.stderr.write('initial\\n');
      const processStderr = process.stderr;
      export default new Promise(resolve => {
			  delete process.stderr;
        process.stderr = new Writable({
          write(chunk, encoding, next) {
            processStderr.write(chunk, encoding, next);
            if (chunk.toString() === 'updated\\n') {
              process.stderr.end();
              process.stderr = processStderr;
              resolve({
                input: 'main.js',
                output: {
                  file: '_actual/output1.js',
                  format: 'es'
                }
              })
            }
          },
        });
      });`
		);
	},
	after() {
		fs.unlinkSync(configFile);
	},
	abortOnStderr(data) {
		if (data === 'initial\n') {
			retries = 0;
			updateConfig();
			return false;
		}
		if (data.includes(`created _actual${path.sep}output2.js`)) {
			clearTimeout(updateRetryTimeout);
			return true;
		}
	}
};

const updateConfig = () => {
	if (retries > 0) {
		console.error('RETRIED updateConfig', retries);
	}
	retries++;
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
		    };`
	);
	// rarely, the watcher does not trigger on MacOS
	updateRetryTimeout = setTimeout(updateConfig, 1000);
};
