var replace = require( 'rollup-plugin-replace' );
var assert = require( 'assert' );

let warnings = [];

module.exports = {
	entry: 'main.js',
	format: 'cjs',
	plugins: [
		replace( { 'ANSWER': 42 } )
	],
	onwarn (warning) {
		// this is called twice, 1st time from CLI and
		// then again from rollup's main method.
		// the tests are different because some deprecations are
		// fixed the first time only
		warnings.push(warning.deprecations);

		const entryDeprecationTest = () => assert.deepEqual(
			warnings[0].filter(d => d.old === 'entry')[0],
			{new: 'input', old: 'entry'}
		);
		
		const formatDeprecationTest = () => assert.deepEqual(
			warnings[0].filter(d => d.old === 'format')[0],
			{new: 'output.format', old: 'format'}
		);

		if (warnings.length === 1) {
			entryDeprecationTest();
			formatDeprecationTest();
		} else if (warnings.length === 2) {
			entryDeprecationTest();
		} else {
			throw new Error('Unwanted warnings');
		}
	}
};
