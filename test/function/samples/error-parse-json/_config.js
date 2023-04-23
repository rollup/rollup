const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_JSON = path.join(__dirname, 'file.json');

module.exports = defineTest({
	description:
		'throws with an extended error message when failing to parse a file with ".json" extension',
	error: {
		cause: {
			pos: 10,
			loc: {
				line: 2,
				column: 8
			},
			raisedAt: 11,
			message: 'Unexpected token (2:8)'
		},
		code: 'PARSE_ERROR',
		id: ID_JSON,
		pos: 10,
		loc: {
			column: 8,
			file: ID_JSON,
			line: 2
		},
		frame: `
			1: {
			2:   "JSON": "is not really JavaScript"
			           ^
			3: }
		`,
		watchFiles: [ID_JSON, ID_MAIN],
		message: 'Unexpected token (Note that you need @rollup/plugin-json to import JSON files)'
	}
});
