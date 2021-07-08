const assert = require('assert');
const fs = require('fs');
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
			if (path.endsWith('test/function/samples/max-parallel-file-reads-error/dep.js')) {
				return callback(Error());
			}

			fsReadFile(path, options, callback);
		};
	},
	after() {
		fs.readFile = fsReadFile;
	},
	error: {
		message: `Could not load ${__dirname}/dep.js (imported by main): `,
		watchFiles: ['main', `${__dirname}/dep.js`]
	}
};
