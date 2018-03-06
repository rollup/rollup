const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'default export is not re-exported with export *',
	error: {
		code: 'MISSING_EXPORT',
		message: `'default' is not exported by foo.js`,
		pos: 7,
		loc: {
			file: path.resolve(__dirname, 'main.js'),
			line: 1,
			column: 7
		},
		frame: `
			1: import def from './foo.js';
			          ^
			2:
			3: console.log( def );
		`,
		url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
	}
};
