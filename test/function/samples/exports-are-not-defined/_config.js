const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_MODULE = path.join(__dirname, 'module.js');

module.exports = defineTest({
	description: 'Throw descriptive error message for used export is not defined',
	error: {
		binding: 'foo',
		code: 'MISSING_EXPORT',
		exporter: ID_MODULE,
		id: ID_MAIN,
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		pos: 9,
		loc: {
			column: 9,
			file: ID_MAIN,
			line: 1
		},
		frame: `
1: import { foo } from './module';
            ^
2: console.log(foo);
		`,
		watchFiles: [ID_MAIN, ID_MODULE],
		message:
			'main.js (1:9): Exported variable "foo" is not defined in "module.js", but it is imported by "main.js".'
	},
	verifyAst: false
});
