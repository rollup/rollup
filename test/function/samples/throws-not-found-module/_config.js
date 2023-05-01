const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'throws error if module is not found',
	error: {
		code: 'UNRESOLVED_IMPORT',
		exporter: './mod',
		id: ID_MAIN,
		watchFiles: [ID_MAIN],
		message: 'Could not resolve "./mod" from "main.js"'
	}
});
