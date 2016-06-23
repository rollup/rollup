const path = require('path');
const assert = require( 'assert' );

function normalize( file ) {
	return path.resolve( __dirname, file ).split( '\\' ).join( '/' );
}

module.exports = {
	description: 'throws on duplicate export * from',
	warnings(warnings) {
		assert.equal( warnings[0], `A module cannot have multiple exports with the same name ('foo')` +
			` from ${normalize( 'foo.js' )} and ${normalize( 'deep.js' )}` );
		assert.equal( warnings.length, 1 );
	}
};
