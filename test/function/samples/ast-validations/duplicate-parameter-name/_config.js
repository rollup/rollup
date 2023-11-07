const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws on duplicate parameter names as it would when running in strict mode',
	error: {
		code: 'DUPLICATE_ARGUMENT_NAME',
		message: 'Duplicate argument name "a"',
		id: ID_MAIN,
		pos: 15,
		watchFiles: [ID_MAIN],
		loc: {
			file: ID_MAIN,
			line: 1,
			column: 15
		},
		frame: `
			1: function foo(a,a) {}
			                  ^`
	}
});
