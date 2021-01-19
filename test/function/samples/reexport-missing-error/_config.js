const path = require('path');

module.exports = {
	description: 'reexporting a missing identifier should print an error',
	error: {
		code: 'MISSING_EXPORT',
		message: `'foo' is not exported by empty.js, imported by main.js`,
		id: path.join(__dirname, 'main.js'),
		pos: 9,
		watchFiles: [path.join(__dirname, 'main.js'), path.join(__dirname, 'empty.js')],
		loc: {
			file: path.join(__dirname, 'main.js'),
			line: 1,
			column: 9
		},
		frame: `
			1: export { foo as bar } from './empty.js';
			            ^
		`,
		url: 'https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module'
	}
};
