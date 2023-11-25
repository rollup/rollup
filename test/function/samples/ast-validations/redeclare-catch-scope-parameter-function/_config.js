const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws when redeclaring local variable in a catch scope as a function',
	error: {
		code: 'REDECLARATION_ERROR',
		frame: `
			3: } catch (e) {
			4:   const a = 1;
			5:   function a() {}
			              ^
			6: }`,
		id: ID_MAIN,
		loc: {
			column: 10,
			file: ID_MAIN,
			line: 5
		},
		message: 'Identifier "a" has already been declared',
		pos: 64,
		watchFiles: [ID_MAIN]
	}
});
