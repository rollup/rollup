const path = require('path');

module.exports = {
	description: 'throws if a dynamic relative import is not found',
	error: {
		code: 'UNRESOLVED_IMPORT',
		message: `Could not resolve './mod' from main.js`,
		watchFiles: [path.resolve(__dirname, 'main.js')]
	}
};
