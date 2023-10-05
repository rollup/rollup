const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'throws on duplicate named exports',
	error: {
		cause: {
			code: 'PARSE_ERROR',
			message: 'the name `foo` is exported multiple times',
			pos: 38
		},
		code: 'PARSE_ERROR',
		message: 'the name `foo` is exported multiple times',
		id: ID_FOO,
		pos: 38,
		watchFiles: [ID_FOO, ID_MAIN],
		loc: {
			file: ID_FOO,
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
});
