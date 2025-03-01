const { mkdirSync, unlinkSync } = require('node:fs');
const path = require('node:path');
const { wait, writeAndSync, writeAndRetry } = require('../../../../testHelpers');

const configFile = path.join(__dirname, 'rollup.config.mjs');
let stopUpdate;

module.exports = defineTest({
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		// This test writes a config file that prints a message to stderr which signals to the test that
		// the config files has been parsed, at which point the test replaces the config file. The
		// initial file returns a Promise that only resolves once the second config file has been
		// parsed. To do that, the first config hooks into process.stderr and looks for a log from the
		// second config.
		// That way, we simulate a complicated config file being changed while it is parsed.
		mkdirSync(path.join(__dirname, '_actual'));
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
		unlinkSync(configFile);
		stopUpdate();
	},
	abortOnStderr(data) {
		if (data === 'initial\n') {
			wait(200).then(() => {
				stopUpdate = writeAndRetry(
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
			});
			return false;
		}
		if (data.includes(`created _actual/output2.js`)) {
			stopUpdate();
			return true;
		}
	}
});
