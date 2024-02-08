const path = require('node:path');
const MAIN_ID = path.resolve(__dirname, './main.js');

module.exports = defineTest({
	description: 'Catch Rust panics and then throw them in Node',
	error: {
		cause: {
			code: 'UNIMPLEMENTED_ERROR',
			message: 'not implemented: Cannot convert Prop::Assign'
		},
		code: 'PARSE_ERROR',
		id: MAIN_ID,
		message: 'not implemented: Cannot convert Prop::Assign',
		pos: undefined,
		watchFiles: [MAIN_ID]
	}
});
