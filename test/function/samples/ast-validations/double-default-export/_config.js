const path = require('node:path');
const ID_FOO = path.join(__dirname, 'foo.js');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws on double default exports',
	error: {
		code: 'DUPLICATE_EXPORT',
		message: 'Duplicate export "default"',
		id: ID_FOO,
		pos: 18,
		watchFiles: [ID_FOO, ID_MAIN],
		loc: {
			file: ID_FOO,
			line: 2,
			column: 0
		},
		frame: `
			1: export default 1;
			2: export default 2;
			   ^
		`
	}
});
