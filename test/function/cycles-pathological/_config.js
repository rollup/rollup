var assert = require( 'assert' );

module.exports = {
	description: 'resolves pathological cyclical dependencies gracefully',
	buble: true,
	warnings: warnings => {
		assert.equal( warnings.length, warnings );
		assert.ok( /Module .+B\.js may be unable to evaluate without .+A\.js, but is included first due to a cyclical dependency. Consider swapping the import statements in .+main\.js to ensure correct ordering/.test( warnings[0] ) );
	}
};
