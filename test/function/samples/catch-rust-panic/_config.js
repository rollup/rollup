const path = require('node:path');
const MAIN_ID = path.resolve(__dirname, './main.js');

module.exports = defineTest({
	description: 'Catch Rust panics and then throw them in Node',
	error: {
		cause: {
			code: 'PARSE_ERROR',
			message: 'not implemented: Cannot convert Prop::Assign',
			pos: undefined
		},
		code: 'PARSE_ERROR',
		id: MAIN_ID,
		message: 'not implemented: Cannot convert Prop::Assign',
		watchFiles: [MAIN_ID]
	}
});
