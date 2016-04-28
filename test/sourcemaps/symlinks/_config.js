var assert = require( 'assert' );

module.exports = {
	description: 'sourcemap resolves symlinks to the real path name',

	test: function (code, map) {
		// Source is in symlinks/, rolledup code and sourcemaps will be in symlinks/_actual,
		// hence the '..'.
		assert.deepEqual( map.sources, [ '../real.js', '../main.js' ]);
	}
};
