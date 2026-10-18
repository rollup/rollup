const { promises: fs } = require('node:fs');
const path = require('node:path');
const { loader } = require('../../../../testHelpers.js');

const fsReadFile = fs.readFile;

module.exports = defineTest({
	description: 'maxParallelFileOps: rejected fs promise error is forwarded',
	options: {
		input: 'main',
		maxParallelFileOps: 1,
		plugins: loader({
			main: `import {foo} from './dep';`
		}),
		fs
	},
	before() {
		fs.readFile = (path, options) =>
			path.endsWith('dep.js') ? Promise.reject(new Error('broken')) : fsReadFile(path, options);
	},
	after() {
		fs.readFile = fsReadFile;
	},
	error: {
		message: `Could not load ${path.join(__dirname, 'dep.js')} (imported by main): broken`,
		watchFiles: [path.join(__dirname, 'dep.js')]
	}
});
