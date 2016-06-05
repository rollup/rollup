var assert = require( 'assert' );

module.exports = {
	description: 'Rollup should not get confused and allow "default" as an identifier name',
	warnings: function () {} // suppress
};

// https://github.com/rollup/rollup/issues/215
