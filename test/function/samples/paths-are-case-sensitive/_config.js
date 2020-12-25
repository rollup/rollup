const path = require('path');

module.exports = {
	description: 'insists on correct casing for imports',
	error: {
		code: 'UNRESOLVED_IMPORT',
		message: `Could not resolve './foo.js' from main.js`,
		watchFiles: [path.join(__dirname, 'main.js')]
	}
};
