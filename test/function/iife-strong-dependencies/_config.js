var assert = require( 'assert' );

var warned;

module.exports = {
	description: 'does not treat references inside IIFEs as weak dependencies', // edge case encountered in THREE.js codebase
	options: {
		onwarn: function ( message ) {
			assert.ok( /Module .+D\.js may be unable to evaluate without .+C\.js, but is included first due to a cyclical dependency. Consider swapping the import statements in .+main\.js to ensure correct ordering/.test( message ) );
			warned = true;
		}
	},
	runtimeError: function () {
		assert.ok( warned );
	}
};
