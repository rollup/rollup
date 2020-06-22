const path = require('path');

module.exports = {
	description: 'default export is not re-exported with export *',
	error: {
		code: 'MISSING_EXPORT',
		message: `'default' is not exported by foo.js, imported by main.js`,
		id: path.resolve(__dirname, 'main.js'),
		pos: 7,
		watchFiles: [
			path.resolve(__dirname, 'main.js'),
			path.resolve(__dirname, 'foo.js'),
			path.resolve(__dirname, 'bar.js')
		],
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
		url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module`
	}
};
