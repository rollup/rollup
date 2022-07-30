const path = require('path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'throws if a dynamic relative import is not found',
	error: {
		code: 'UNRESOLVED_IMPORT',
		exporter: './mod',
		id: ID_MAIN,
		message: 'Could not resolve "./mod" from "main.js"',
		watchFiles: [ID_MAIN]
	}
};
