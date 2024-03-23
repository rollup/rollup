const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_JSON = path.join(__dirname, 'file.json');

module.exports = defineTest({
	description:
		'throws with an extended error message when failing to parse a file with ".json" extension',
	error: {
		cause: {
			code: 'PARSE_ERROR',
			pos: 10,
			message: "Expected ';', '}' or <eof>"
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
		message:
			"file.json (2:8): Expected ';', '}' or <eof> (Note that you need @rollup/plugin-json to import JSON files)"
	}
});
