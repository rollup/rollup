const path = require('node:path');

const MAIN_ID = path.resolve(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws a catchable error for too deeply nested expressions',
	error: {
		cause: {
			code: 'PARSE_ERROR',
			message:
				'Maximum nesting depth of 2000 exceeded, reduce nesting or split the expression into smaller parts',
			pos: 0
		},
		code: 'PARSE_ERROR',
		frame: `
			1: a
			   ^
			2: || a
			3: || a
		`,
		id: MAIN_ID,
		loc: { column: 0, file: MAIN_ID, line: 1 },
		message:
			'main.js (1:0): Maximum nesting depth of 2000 exceeded, reduce nesting or split the expression into smaller parts',
		pos: 0
	},
	options: {
		plugins: [
			{
				load(id) {
					if (id === MAIN_ID) {
						return Array.from({ length: 2500 }, () => 'a').join('\n|| ');
					}
				},
				name: 'generate-deeply-nested-expressions'
			}
		]
	}
});
