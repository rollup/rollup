const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'warns on missing (but unused) imports',
	warnings: [
		{
			binding: 'b',
			code: 'MISSING_EXPORT',
			exporter: ID_FOO,
			id: ID_MAIN,
			message: '"b" is not exported by "foo.js", imported by "main.js".',
			url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
			pos: 12,
			loc: {
				column: 12,
				file: ID_MAIN,
				line: 1
			},
			frame: `
				1: import { a, b } from './foo.js';
				               ^
				2:
				3: assert.equal( a, 42 );`
		}
	]
});
