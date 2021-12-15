const { join } = require('path');

module.exports = {
	description: 'throw error if extension is required but not in the import path',
	error: {
		code: 'UNRESOLVED_IMPORT',
		message: "Could not resolve './dep' from main.js",
		watchFiles: [join(__dirname, 'main.js')]
	},
	options: {
		fileExtensions: true
	}
};
