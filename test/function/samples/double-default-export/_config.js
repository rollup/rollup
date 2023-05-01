const path = require('node:path');
const ID_FOO = path.join(__dirname, 'foo.js');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws on double default exports',
	error: {
		cause: {
			loc: {
				column: 7,
				line: 2
			},
			message: "Duplicate export 'default' (2:7)",
			pos: 25,
			raisedAt: 34
		},
		code: 'PARSE_ERROR',
		message: `Duplicate export 'default'`,
		id: ID_FOO,
		pos: 25,
		watchFiles: [ID_FOO, ID_MAIN],
		loc: {
			file: ID_FOO,
			line: 2,
			column: 7
		},
		frame: `
			1: export default 1;
			2: export default 2;
			          ^
		`
	}
});
