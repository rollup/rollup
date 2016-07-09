const { resolve } = require('path');
const assert = require( 'assert' );

const r = path => resolve( __dirname, path );

module.exports = {
	description: 'throws on duplicate export * from',
	warnings ( warnings ) {
		assert.deepEqual( warnings, [
			`Conflicting namespaces: ${r('main.js')} re-exports 'foo' from both ${r('foo.js')} (will be ignored) and ${r('deep.js')}.`
		]);
	}
};
