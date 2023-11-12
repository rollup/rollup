const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring the parameter of a catch scope as a function',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			2:   throw new Error('failed');
			3: } catch (error) {
			4:   function error() {}
			              ^
			5: }`,
		id: ID_MAIN,
		loc: {
			column: 10,
			file: ID_MAIN,
			line: 4
		},
		message: 'Identifier "error" has already been declared',
		pos: 62,
		watchFiles: [ID_MAIN]
	}
});
