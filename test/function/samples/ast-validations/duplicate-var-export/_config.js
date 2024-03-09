const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws on duplicate exports declared with "var"',
	error: {
		code: 'DUPLICATE_EXPORT',
		message: 'main.js (2:11): Duplicate export "x"',
		id: ID_MAIN,
		pos: 29,
		watchFiles: [ID_MAIN],
		loc: {
			file: ID_MAIN,
			line: 2,
			column: 11
		},
		frame: `
			1: export var x = 1;
			2: export var x = 2;
			              ^`
	}
});
