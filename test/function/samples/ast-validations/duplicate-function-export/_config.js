const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws on duplicate namespace exports',
	error: {
		code: 'DUPLICATE_EXPORT',
		message: 'main.js (3:16): Duplicate export "foo"',
		id: ID_MAIN,
		pos: 54,
		watchFiles: [ID_MAIN],
		loc: {
			file: ID_MAIN,
			line: 3,
			column: 16
		},
		frame: `
			1: const bar = 1;
			2: export { bar as foo };
			3: export function foo() {}
			                   ^`
	}
});
