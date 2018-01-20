const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'throws on duplicate named exports',
	error: {
		code: 'PARSE_ERROR',
		message: `Duplicate export 'foo'`,
		pos: 38,
		loc: {
			file: path.resolve(__dirname, 'foo.js'),
			line: 3,
			column: 9
		},
		frame: `
			1: var foo = 1;
			2: export { foo };
			3: export { foo } from './bar.js';
			            ^
		`
	}
};
