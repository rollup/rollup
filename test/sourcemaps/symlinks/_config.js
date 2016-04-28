var assert = require( 'assert' );

module.exports = {
	description: 'sourcemap resolves symlinks to the real path name',

	test: function (code, map) {
		assert.deepEqual( map.sources, [ 'real.js', 'main.js' ]);
	}
};
