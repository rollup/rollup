const fs = require('fs');
const path = require('path');
const { atomicWriteFileSync } = require('../../../../utils');

let configFile;

module.exports = {
	repeat: 10,
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		// This test writes a config file that watches itself for changes and resolves only once it has
		// been rewritten. As soon as that watcher is set up, the config file writes a message to stderr
		// that is observed by the parent process and triggers overwriting the config file.
		// That way, we reliably simulate a complicated config file being changed while it is parsed.
		fs.mkdirSync(path.resolve(__dirname, '_actual'));
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(
			configFile,
			`
		  import chokidar from 'chokidar';
      export default new Promise(resolve => {
				const watcher = chokidar.watch(${JSON.stringify(configFile)})
				  .on('change', () => {
				    watcher.close();
				    setTimeout(() => resolve({
              input: { output1: 'main.js' },
              output: {
                dir: '_actual',
                format: 'es'
              }
            }), 600)
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
