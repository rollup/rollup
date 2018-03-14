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
					message: 'Unknown option found: abc. Allowed keys: acorn, acornInjectPlugins, cache, context, experimentalCodeSplitting, experimentalDynamicImport, input, legacy, moduleContext, onwarn, perf, plugins, preferConst, preserveSymlinks, treeshake, watch, entry, external, amd, banner, dir, exports, extend, file, footer, format, freeze, globals, indent, interop, intro, legacy, name, namespaceToStringTag, noConflict, outro, paths, sourcemap, sourcemapFile, strict, pureExternalModules'
				}
			);
		} else {
			throw new Error('Unwanted warnings');
		}
	}
};
