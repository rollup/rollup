const assert = require( 'assert' );

let warnings = [];

module.exports = {
	description: 'preserves sourcemap chains when transforming',
	before: () => warnings = [], // reset
	options: {
		plugins: [
			{
				name: 'fake plugin',
				transform: function ( code ) {
					return code;
				}
			}
		],
		onwarn ( msg ) {
			warnings.push( msg );
		}
	},
	test: () => {
		assert.deepEqual( warnings, [
			`Sourcemap is likely to be incorrect: a plugin ('fake plugin') was used to transform files, but didn't generate a sourcemap for the transformation. Consult https://github.com/rollup/rollup/wiki/Troubleshooting and the plugin documentation for more information`
		]);
	}
};
