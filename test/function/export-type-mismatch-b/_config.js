var assert = require( 'assert' );

module.exports = {
	description: 'export type must be auto, default, named or none',
	bundleOptions: {
		exports: 'blah'
	},
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message: `options.exports must be 'default', 'named', 'none', 'auto', or left unspecified (defaults to 'auto')`
	}
};
