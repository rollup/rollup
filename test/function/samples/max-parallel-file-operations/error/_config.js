const { promises: fs } = require('node:fs');
const { join } = require('node:path');
const { loader } = require('../../../../utils.js');

const fsReadFile = fs.readFile;

module.exports = defineTest({
	description: 'maxParallelFileOps: fileRead error is forwarded',
	options: {
		input: 'main',
		plugins: loader({
			main: `import {foo} from './dep';`
		})
	},
	before() {
		fs.readFile = (path, options) => {
			if (path.endsWith('dep.js')) {
				throw new Error('broken');
			}

			fsReadFile(path, options);
		};
	},
	after() {
		fs.readFile = fsReadFile;
	},
	error: {
		message: `Could not load ${join(__dirname, 'dep.js')} (imported by main): broken`,
		watchFiles: [join(__dirname, 'dep.js'), 'main']
	}
});
