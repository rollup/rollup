var assert = require('assert');

module.exports = {
	description: 'insists on correct casing for imports',
	error: {
		code: 'UNRESOLVED_IMPORT',
		message: `Could not resolve './foo.js' from main.js`
	}
};
