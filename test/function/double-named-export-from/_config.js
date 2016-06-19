const path = require('path');
const assert = require( 'assert' );

function normalize( file ) {
	return path.resolve( __dirname, file ).split( '\\' ).join( '/' );
}

module.exports = {
	description: 'throws on duplicate export * from',
	error: err => {
		assert.equal( err.message, `A module cannot have multiple exports with the same name ('foo')` +
			` from ${normalize( 'foo.js' )} and ${normalize( 'deep.js' )}` );
	}
};
