var assert = require( 'assert' );

module.exports = {
	description: 'does not treat references inside IIFEs as weak dependencies', // edge case encountered in THREE.js codebase
	warnings: warnings => {
		assert.equal( warnings.length, 1 );
		assert.ok( /Module .+D\.js may be unable to evaluate without .+C\.js, but is included first due to a cyclical dependency. Consider swapping the import statements in .+main\.js to ensure correct ordering/.test( warnings[0] ) );
	}
};
