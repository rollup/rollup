const fs = require('fs');
const path = require('path');
const { loader } = require('../../../utils.js');

const fsReadFile = fs.readFile;

module.exports = {
	description: 'maxParallelFileReads: fileRead error is forwarded',
	options: {
		input: 'main',
		plugins: loader({
			main: `import {foo} from './dep';`
		})
	},
	before() {
		fs.readFile = (path, options, callback) => {
			if (path.endsWith('dep.js')) {
				return callback(new Error('broken'));
			}

			fsReadFile(path, options, callback);
		};
	},
	after() {
		fs.readFile = fsReadFile;
	},
	error: {
		message: `Could not load ${path.join(__dirname, 'dep.js')} (imported by main): broken`,
		watchFiles: ['main', path.join(__dirname, 'dep.js')]
	}
};
