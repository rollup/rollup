const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

let configFile;
let messageFile;
let reloadTriggered = false;

module.exports = {
	description: 'immediately reloads the config file if a change happens while it is parsed',
	command: 'rollup -cw',
	before() {
		messageFile = path.resolve(__dirname, '_actual', 'message.txt');
		fs.mkdirSync(path.resolve(__dirname, '_actual'));
		fs.writeFileSync(messageFile, 'initial');
		configFile = path.resolve(__dirname, 'rollup.config.js');
		fs.writeFileSync(
			configFile,
			`
			import path from 'path';
		  import fs from 'fs';
		  import chokidar from 'chokidar';
		  const messageFile = path.resolve(__dirname, '_actual', 'message.txt');
		  export default new Promise(resolve => {
		    fs.writeFileSync(messageFile, 'loading');
		    const watcher = chokidar.watch(messageFile).on('change', () => {
		      const content = fs.readFileSync(messageFile, 'utf8');
		      if (content === 'loaded') {
		        watcher.close();
		        setTimeout(() => {
		          fs.writeFileSync(messageFile, 'resolved');
		          resolve({
		            input: {output1: "main.js"},
		            output: {
		              dir: "_actual",
		              format: "es"
		            }
		          });
		        }, 500);
		      }
		    });
		  });
		`
		);
		const watcher = chokidar.watch(messageFile).on('change', () => {
			const content = fs.readFileSync(messageFile, 'utf8');
			if (content === 'loading') {
				watcher.close();
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
					fs.writeFileSync(messageFile, 'loaded');
				}, 500);
			}
		});
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
