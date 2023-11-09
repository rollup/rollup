const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description:
		'throws when redeclaring a parameter of a catch scope as a var that conflicts with an outside binding',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			3:   throw new Error('failed');
			4: } catch (error) {
			5:   var error;
			         ^
			6: }`,
		id: ID_MAIN,
		loc: {
			column: 5,
			file: ID_MAIN,
			line: 5
		},
		message: 'Identifier "error" has already been declared',
		pos: 68,
		watchFiles: [ID_MAIN]
	}
});
