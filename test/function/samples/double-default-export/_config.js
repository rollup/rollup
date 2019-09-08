const path = require('path');

module.exports = {
	description: 'throws on double default exports',
	error: {
		code: 'PARSE_ERROR',
		message: `Duplicate export 'default'`,
		pos: 25,
		watchFiles: [path.resolve(__dirname, 'main.js'), path.resolve(__dirname, 'foo.js')],
		loc: {
			file: path.resolve(__dirname, 'foo.js'),
			line: 2,
			column: 7
		},
		frame: `
			1: export default 1;
			2: export default 2;
			          ^
		`
	}
};
