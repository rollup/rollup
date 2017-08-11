var assert = require( 'assert' );

module.exports = {
	description: 'cannot have named exports if explicit export type is default',
	bundleOptions: {
		exports: 'none'
	},
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message: `'none' was specified for options.exports, but entry module has following exports: default`
	}
};
