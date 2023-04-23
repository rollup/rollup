const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'throws on duplicate named exports',
	error: {
		cause: {
			loc: {
				column: 9,
				line: 3
			},
			message: "Duplicate export 'foo' (3:9)",
			pos: 38,
			raisedAt: 43
		},
		code: 'PARSE_ERROR',
		message: `Duplicate export 'foo'`,
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
