var assert = require( 'assert' );

module.exports = {
	description: 'Rollup should not get confused and allow "default" as an identifier name',
	warnings: function ( warnings ) {
		// ignore pending gh-587
	}
};

// https://github.com/rollup/rollup/issues/215
