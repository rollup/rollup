const path = require('path');

module.exports = {
	description: 'missing relative imports are an error, not a warning',
	error: {
		code: 'UNRESOLVED_IMPORT',
		message: `Could not resolve './missing.js' from main.js`,
		watchFiles: [path.resolve(__dirname, 'main.js')]
	}
};
