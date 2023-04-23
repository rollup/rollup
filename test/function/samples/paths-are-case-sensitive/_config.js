const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineRollupTest({
	description: 'insists on correct casing for imports',
	error: {
		code: 'UNRESOLVED_IMPORT',
		exporter: './foo.js',
		id: ID_MAIN,
		watchFiles: [ID_MAIN],
		message: 'Could not resolve "./foo.js" from "main.js"'
	}
});
