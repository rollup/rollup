const path = require('path');
const assert = require( 'assert' );

function normalize ( file ) {
	return path.resolve( __dirname, file ).split( '\\' ).join( '/' );
}

module.exports = {
	description: 'throws on duplicate export * from',
	warnings ( warnings ) {
		assert.deepEqual( warnings, [
			`Conflicting namespaces: ${normalize('main.js')} re-exports 'foo' from both ${normalize('foo.js')} (will be ignored) and ${normalize('deep.js')}.`
		]);
	}
};
