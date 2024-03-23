const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring a pattern parameter of a catch scope as a var',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			2:   throw new Error('failed');
			3: } catch ({ message }) {
			4:   var message;
			         ^
			5: }`,
		id: ID_MAIN,
		loc: {
			column: 5,
			file: ID_MAIN,
			line: 4
		},
		message: 'main.js (4:5): Identifier "message" has already been declared',
		pos: 63,
		watchFiles: [ID_MAIN]
	}
});
