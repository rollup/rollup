var assert = require('assert');
var path = require('path');

module.exports = {
	description: 'throws error if module is not found',
	error: {
		code: 'UNRESOLVED_IMPORT',
		message: `Could not resolve './mod' from main.js`
	}
};
