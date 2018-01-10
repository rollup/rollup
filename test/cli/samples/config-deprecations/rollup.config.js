var replace = require( 'rollup-plugin-replace' );
var assert = require( 'assert' );

let warnings = [];

module.exports = {
	entry: 'main.js',
	format: 'cjs',
	abc: 1,
	plugins: [
		replace( { 'ANSWER': 42 } )
	],
	onwarn (warning) {
		// this is called twice, 1st time from CLI and
		// then again from rollup's main method.
		// the tests are different because some deprecations are
		// fixed the first time only
		warnings.push(warning);

		const deprecationTest = () => assert.deepEqual(
			warnings[0].deprecations,
			[{new: 'input', old: 'entry'}, {new: 'output.format', old: 'format'}]
		);

		if (warnings.length === 1) {
			deprecationTest();
		} else if (warnings.length === 2) {
			deprecationTest();
			assert.deepEqual(
				warnings[1],
				{
					code: 'UNKNOWN_OPTION',
					message: 'Unknown option found: abc. Allowed keys: input, legacy, treeshake, acorn, acornInjectPlugins, context, moduleContext, plugins, onwarn, watch, cache, preferConst, experimentalDynamicImport, entry, external, extend, amd, banner, footer, intro, format, outro, sourcemap, sourcemapFile, name, globals, interop, legacy, freeze, indent, strict, noConflict, paths, exports, file, pureExternalModules'
				}
				
			);
		} else {
			throw new Error('Unwanted warnings');
		}
	}
};
