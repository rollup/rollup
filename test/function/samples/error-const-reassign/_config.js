const path = require('node:path');
const MAIN_ID = path.resolve(__dirname, 'main.js');

module.exports = defineTest({
	description: 'Cannot reassign a variable declared with `const`',
	error: {
		code: 'CONST_REASSIGN',
		frame: `
			1: const foo = 1;\n2: foo = 2;\n   ^
		`,
		id: MAIN_ID,
		loc: {
			column: 0,
			file: MAIN_ID,
			line: 2
		},
		message: 'Cannot reassign a variable declared with `const`',
		pos: 15,
		watchFiles: [MAIN_ID]
	}
});
