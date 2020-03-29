const fs = require('fs');
const path = require('path');

let configFile;
let messageFile;
let reloadTriggered = false;

module.exports = {
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		configFile = path.resolve(__dirname, 'rollup.config.js');
		messageFile = path.resolve(__dirname, '_actual', 'message.txt');
		fs.mkdirSync(path.resolve(__dirname, '_actual'));
		fs.writeFileSync(messageFile, 'initial');
		fs.writeFileSync(
			configFile,
			`
			import path from 'path';
		  import fs from 'fs';
		  const messageFile = path.resolve(__dirname, '_actual', 'message.txt');
		  export default new Promise(resolve => {
		    fs.writeFileSync(messageFile, 'loading');
		    const watcher = fs.watch(messageFile, event => {
		      if (event === 'change') {
		        const content = fs.readFileSync(messageFile, 'utf8');
		        if (content === 'loaded') {
		          watcher.close();
		          fs.writeFileSync(messageFile, 'resolved');
		          resolve({
		            input: {output1: "main.js"},
		            output: {
		              dir: "_actual",
		              format: "es"
		            }
		          });
		        }
		      }
		    });
		  });
		`
		);
		const watcher = fs.watch(messageFile, (event) => {
			if (event === 'change') {
				const content = fs.readFileSync(messageFile, 'utf8');
				if (content === 'loading') {
					watcher.close();
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
					fs.writeFileSync(messageFile, 'loaded');
				}
			}
		});
	},
	abortOnStderr(data) {
		if (reloadTriggered && data.includes('created _actual')) {
			return true;
		} else if (data.includes('Reloading updated config')) {
			reloadTriggered = true;
			return false;
		}
	},
};
