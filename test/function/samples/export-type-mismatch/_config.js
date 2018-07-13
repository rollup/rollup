var assert = require('assert');

module.exports = {
	description: 'cannot have named exports if explicit export type is default',
	options: { output: { exports: 'default' } },
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message: `'default' was specified for output.exports, but entry module has following exports: foo`
	}
};
