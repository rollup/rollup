const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP = path.join(__dirname, 'dep.js');

module.exports = defineTest({
	description: 'shows the original name when an import that starts with "*" is missing',
	error: {
		binding: '*',
		code: 'MISSING_EXPORT',
		exporter: ID_DEP,
		id: ID_MAIN,
		url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
		pos: 9,
		loc: {
			column: 9,
			file: ID_MAIN,
			line: 1
		},
		frame: `
			1: import { '*' as star } from './dep.js';
			            ^
			2:
			3: assert.strictEqual(star, 'star');
		`,
		watchFiles: [ID_DEP, ID_MAIN],
		message: 'main.js (1:9): "*" is not exported by "dep.js", imported by "main.js".'
	}
});
