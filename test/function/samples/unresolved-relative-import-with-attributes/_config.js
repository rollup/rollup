const path = require('node:path');

module.exports = defineTest({
	description: 'describes unresolved relative imports with attributes in the error message',
	error: {
		code: 'UNRESOLVED_IMPORT',
		exporter: './missing.js',
		id: path.join(__dirname, 'main.js'),
		message:
			'Could not resolve "./missing.js" with import attributes {"type":"json"} from "main.js"',
		watchFiles: [path.join(__dirname, 'main.js')]
	}
});
