const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'missing relative imports are an error, not a warning',
	error: {
		code: 'UNRESOLVED_IMPORT',
		exporter: './missing.js',
		id: ID_MAIN,
		watchFiles: [ID_MAIN],
		message: 'Could not resolve "./missing.js" from "main.js"'
	}
});
