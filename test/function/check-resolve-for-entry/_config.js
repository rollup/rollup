var assert = require( 'assert' );

module.exports = {
	description: 'checks that entry is resolved',
	options: {
		entry: '/not/a/path/that/actually/really/exists'
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Could not resolve entry (/not/a/path/that/actually/really/exists)'
	}
};
