var assert = require( 'assert' );

var warned;

module.exports = {
	description: 'resolves pathological cyclical dependencies gracefully',
	babel: true,
	options: {
		onwarn: function ( message ) {
			assert.ok( /Module .+B\.js may be unable to evaluate without .+A\.js, but is included first due to a cyclical dependency. Consider swapping the import statements in .+main\.js to ensure correct ordering/.test( message ) );
			warned = true;
		}
	},
	runtimeError: function () {
		assert.ok( warned );
	}
};
